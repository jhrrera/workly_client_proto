import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environment/environment';

interface FirebaseLoginResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebaseUrl =
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseApiKey}`;

  private readonly _authenticated = signal(false);
  readonly authenticated = this._authenticated.asReadonly();

  private readonly _me = signal<AuthMeResponse | null>(null);
  readonly me = this._me.asReadonly();

  private sessionChecked = false;

  constructor(private http: HttpClient) {}

login(email: string, password: string): Observable<void> {
  return this.http.post<FirebaseLoginResponse>(this.firebaseUrl, {
    email,
    password,
    returnSecureToken: true
  }).pipe(
    switchMap(res =>
      this.http.get('/auth/csrf', { withCredentials: true }).pipe(
        switchMap(() =>
          this.http.post<void>(
            '/auth/session',
            { idToken: res.idToken },
            { withCredentials: true }
          )
        )
      )
    ),
    tap(() => {
      this._authenticated.set(true);
      this.sessionChecked = true;
    }),
    catchError(err => {
      this._authenticated.set(false);
      this.sessionChecked = true;
      return throwError(() => err);
    })
  );
}


logout(): Observable<void> {
  return this.ensureCsrf().pipe(
    switchMap(csrf =>
      this.http.post<void>(
        '/auth/logout',
        {},
        {
          headers: {
            [csrf.headerName]: csrf.token
          }
        }
      )
    ),
    tap(() => {
      this._authenticated.set(false);
      this._me.set(null);
      this.sessionChecked = true;
    })
  );
}

private ensureCsrf(): Observable<CsrfResponse> {
  return this.http.get<CsrfResponse>('/auth/csrf');
}

  checkSession(force = false): Observable<boolean> {
    
    if (this.sessionChecked && !force) {
      return of(this._authenticated());
    }

    return this.fetchMe().pipe(
      map(user => {
        this._me.set(user);
        this._authenticated.set(true);
        this.sessionChecked = true;
        return true;
      }),
      catchError(() => {
        this._me.set(null);
        this._authenticated.set(false);
        this.sessionChecked = true;
        return of(false);
      })
    );
  }

  private fetchMe(): Observable<AuthMeResponse> {
    return this.http.get<AuthMeResponse>('/auth/me');
  }

}

interface CsrfResponse {
  parameterName: string;
  headerName: string;
  token: string;
}

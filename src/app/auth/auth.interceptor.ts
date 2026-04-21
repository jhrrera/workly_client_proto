import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environment/environment';

function readCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);
  const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);

  if (!isApiRequest) {
    return next(req);
  }

  let cloned = req.clone({
    withCredentials: true
  });

  if (isMutating) {
    const csrfToken = readCookie('XSRF-TOKEN');

    if (csrfToken) {
      cloned = cloned.clone({
        setHeaders: {
          'X-XSRF-TOKEN': csrfToken
        }
      });
    }
  }

  return next(cloned);
};
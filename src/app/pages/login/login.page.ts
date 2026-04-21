import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { AuthService } from '../../auth/auth.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzGridModule,
    NzAlertModule
  ],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="brand">
          <h1>Workly</h1>
          <p>Inicia sesión para continuar</p>
        </div>
       @if (validateForm.errors?.['invalidCredentials']) {
          <nz-alert
            nzType="error"
            nzMessage="Correo o contraseña incorrectos."
            class="login-form-margin"
          />
        }

        <form nz-form [formGroup]="validateForm" class="login-form" (ngSubmit)="submitForm()">
          <nz-form-item>
            <nz-form-control nzErrorTip="Ingresa tu usuario">
              <nz-input-group nzPrefixIcon="user">
                <input type="text" nz-input formControlName="username" placeholder="Usuario" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control nzErrorTip="Ingresa tu contraseña">
              <nz-input-group nzPrefixIcon="lock">
                <input type="password" nz-input formControlName="password" placeholder="Contraseña" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <div nz-row class="login-form-margin">
            <div nz-col [nzSpan]="12">
              <label nz-checkbox formControlName="remember">
                <span>Recordarme</span>
              </label>
            </div>

            <div nz-col [nzSpan]="12">
              <a class="login-form-forgot">Olvidé mi contraseña</a>
            </div>
          </div>

          <button nz-button nzType="primary" class="login-form-button login-form-margin">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f0f2f5;
    }

    .login-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
    }

    .login-card {
      width: 100%;
      max-width: 380px;
      background: #fff;
      border-radius: 16px;
      padding: 32px 24px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    }

    .brand {
      text-align: center;
      margin-bottom: 24px;
    }

    .brand h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #262626;
    }

    .brand p {
      margin: 8px 0 0;
      color: #8c8c8c;
    }

    .login-form {
      max-width: 100%;
    }

    .login-form-margin {
      margin-bottom: 16px;
    }

    .login-form-forgot {
      float: right;
    }

    .login-form-button {
      width: 100%;
    }
  `]
})
export class LoginPage {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error: String = "";

  validateForm = this.fb.group({
    username: this.fb.control('', [Validators.required]),
    password: this.fb.control('', [Validators.required]),
    remember: this.fb.control(true)
  });
  

 submitForm(): void {
  if (this.validateForm.valid) {
    const { username, password } = this.validateForm.getRawValue();

    this.auth.login(username, password).subscribe({
      next: () => {
        this.router.navigateByUrl('/gente/organigrama');
      },
      error: (e) => {
        this.validateForm.setErrors({ invalidCredentials: true });
        console.log(e);
      }
    });

    return;
  }

  Object.values(this.validateForm.controls).forEach(control => {
    if (control.invalid) {
      control.markAsDirty();
      control.updateValueAndValidity({ onlySelf: true });
    }
  });
}
}
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { NzConfig, provideNzConfig } from 'ng-zorro-antd/core/config';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { authInterceptor } from './auth/auth.interceptor';
import { apiCredentialsInterceptor } from './auth/api-credentials.interceptor';

registerLocaleData(es);

const ngZorroConfig: NzConfig = {
  theme: {
    primaryColor: '#0a8080'
  }
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideNzI18n(es_ES), 
    provideNzConfig(ngZorroConfig), 
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      }),
      withInterceptors([apiCredentialsInterceptor])
    )]
};

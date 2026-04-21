import { HttpInterceptorFn } from '@angular/common/http';

export const apiCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith('/auth') || req.url.startsWith('/api');

  if (!isApiRequest) {
    return next(req);
  }

  return next(req.clone({ withCredentials: true }));
};
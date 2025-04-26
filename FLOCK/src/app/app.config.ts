import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
// Убедитесь, что импортирован provideHttpClient и withInterceptorsFromDi
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
// Убедитесь, что импортирован JwtInterceptor
import { JwtInterceptor } from './interceptors/jwt.interceptor';

// Провайдер для интерсептора
export const jwtInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: JwtInterceptor,
  multi: true,
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Используем provideHttpClient с withInterceptorsFromDi
    provideHttpClient(withInterceptorsFromDi()),
    // Регистрируем интерсептор через HTTP_INTERCEPTORS
    jwtInterceptorProvider
  ]
};

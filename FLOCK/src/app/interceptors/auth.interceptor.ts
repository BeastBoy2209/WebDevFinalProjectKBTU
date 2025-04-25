import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Проверяем, работаем ли мы в браузере
    if (isPlatformBrowser(this.platformId)) {
      // Получаем токен
      const token = localStorage.getItem('token');
      // console.log('AuthInterceptor: Токен из localStorage:', token ? 'Найден' : 'Не найден'); // Логирование убрано

      // Если токен есть, добавляем его в заголовок, кроме запросов на /auth/login и /auth/register
      if (token) {
        if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
           // console.log('AuthInterceptor: Пропуск добавления токена для URL:', request.url); // Логирование убрано
           return next.handle(request);
        }

        // console.log('AuthInterceptor: Добавление токена для URL:', request.url); // Логирование убрано
        const authRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(authRequest);
      } else {
         // console.log('AuthInterceptor: Токен не найден в localStorage для URL:', request.url); // Логирование убрано
      }
    } else {
       // console.log('AuthInterceptor: Не в браузере, пропуск добавления токена для URL:', request.url); // Логирование убрано
    }

    // Если нет токена или не в браузере, отправляем запрос как есть
    return next.handle(request);
  }
}

/* // Комментируем экспорт, чтобы этот интерцептор не использовался
export const authInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
};
*/
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HTTP_INTERCEPTORS // Импортируем HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Не добавляем токен для запросов авторизации
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
      console.log('JwtInterceptor: Пропуск добавления токена для URL:', request.url); // Логирование
      return next.handle(request);
    }

    // Для остальных запросов добавляем токен
    const token = this.authService.getToken();
    if (token) {
      console.log('JwtInterceptor: Добавление токена для URL:', request.url); // Логирование
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
       console.log('JwtInterceptor: Токен не найден для URL:', request.url); // Логирование
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Если ошибка 401 (Unauthorized) или связана с невалидным токеном
        if (
          error.status === 401 ||
          (error.error &&
           typeof error.error === 'object' &&
           error.error.code === 'token_not_valid')
        ) {
          console.log('JwtInterceptor: Ошибка авторизации (401), выполняем выход'); // Логирование
          this.authService.logout();
          // Перенаправляем на страницу входа с помощью Router
          this.router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
        }
        return throwError(() => error);
      })
    );
  }
}

// Добавляем провайдер для регистрации интерцептора
export const jwtInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: JwtInterceptor,
  multi: true
};
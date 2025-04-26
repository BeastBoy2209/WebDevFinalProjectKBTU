import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service'; // Убедитесь, что путь правильный
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; // Импорт для проверки платформы

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Инжектируем PLATFORM_ID
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Проверяем, что это браузер
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let token: string | null = null;

    // Получаем токен только если код выполняется в браузере
    if (this.isBrowser) {
      token = this.authService.getToken();
    }

    // Клонируем запрос и добавляем заголовок Authorization, если токен есть
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // Или 'JWT ' в зависимости от настроек DRF Simple JWT
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Обработка ошибки 401 (Unauthorized) - например, разлогинивание пользователя
        if (error.status === 401 && this.isBrowser) { // Добавляем проверку на браузер
          console.error('Unauthorized request - logging out:', error);
          this.authService.logout(); // Вызываем метод logout из AuthService
          // Можно добавить перенаправление на страницу логина
          // this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url }});
        }
        return throwError(() => error); // Передаем ошибку дальше
      })
    );
  }
}
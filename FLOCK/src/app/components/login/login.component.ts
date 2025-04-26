import { Component, OnInit, NgZone, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http'; // Импортируем HttpErrorResponse

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  registrationSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Обработка конфликтов с расширениями браузера
    this.handleBrowserExtensions();
    
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // НЕ очищаем данные старой сессии при открытии страницы логина
    // this.authService.logout();
    
    // Проверяем, пришел ли пользователь после успешной регистрации
    this.route.queryParams.subscribe(params => {
      this.registrationSuccess = params['registered'] === 'true';
    });
  }

  private handleBrowserExtensions(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      if (window && (window as any).binance) {
        console.log('Обнаружено Binance расширение, применяются исправления');
        
        const originalBinanceExt = (window as any).binance;
        
        (window as any).binance = {
          ...originalBinanceExt,
          provider: {
            ...originalBinanceExt?.provider,
            request: function(args: any) {
              console.warn('Перехвачен запрос к Binance провайдеру', args);
              return Promise.resolve(null);
            }
          }
        };
      }
    } catch (e) {
      console.warn('Ошибка при обработке расширений браузера:', e);
    }
  }

  onSubmit() {
    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      console.log('Форма входа невалидна', this.loginForm.errors);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Нормализуем email перед отправкой
    const email = this.loginForm.get('email')?.value.trim().toLowerCase();
    const password = this.loginForm.get('password')?.value;

    // Дополнительная проверка формата email
    if (!this.isValidEmail(email)) {
      console.log('Некорректный формат email');
      this.errorMessage = 'Некорректный формат email';
      this.loading = false;
      return;
    }

    try {
      console.log('Отправка запроса на авторизацию', { email });
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Получен ответ от сервера:', response);
          // Проверка наличия токена в ответе
          if (response && response.token) {
            console.log('Успешная авторизация, перенаправление...');
            
            // Используем NgZone для выполнения навигации, чтобы избежать ошибок с зоной Angular
            this.ngZone.run(() => {
              this.router.navigate(['/swipe']);
            });
          } else {
            console.error('Неверный формат ответа:', response);
            this.errorMessage = 'Ошибка авторизации: недействительный ответ сервера';
            this.loading = false;
          }
        },
        error: (error: HttpErrorResponse) => { // Используем HttpErrorResponse
          console.error('Ошибка входа:', error);
          this.loading = false; // Устанавливаем loading в false

          if (error.status === 401) {
            // Используем сообщение от сервера, если оно есть, иначе стандартное
            this.errorMessage = error.error?.message || error.error?.detail || 'Неверный email или пароль';
          } else if (error.status === 404) {
            this.errorMessage = 'Ошибка: Сервис авторизации не найден (404).';
          } else if (error.status === 0 || error.status >= 500) {
            this.errorMessage = 'Ошибка соединения с сервером. Пожалуйста, попробуйте позже.';
          } else if (error.error && typeof error.error === 'object') {
              // Попытка извлечь сообщение из объекта ошибки
              this.errorMessage = error.error.message || error.error.detail || `Ошибка (${error.status})`;
          } else if (typeof error.error === 'string') {
              this.errorMessage = error.error;
          }
           else {
            this.errorMessage = `Произошла неизвестная ошибка (${error.status}).`;
          }
        },
        complete: () => {
            // Можно убрать, т.к. loading сбрасывается в next и error
            // this.loading = false;
        }
      });
    } catch (e) {
      console.error('Неожиданная ошибка при выполнении запроса:', e);
      this.errorMessage = 'Произошла неожиданная ошибка. Пожалуйста, попробуйте позже.';
      this.loading = false;
    }
  }

  // Метод для повторной попытки авторизации
  private retryLogin(email: string, password: string): void {
    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (response && response.token) {
          console.log('Успешная повторная авторизация');
          this.ngZone.run(() => {
            this.router.navigate(['/swipe']);
          });
        } else {
          this.errorMessage = 'Ошибка повторной авторизации';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Ошибка при повторной авторизации:', error);
        this.errorMessage = 'Ошибка авторизации. Пожалуйста, попробуйте позже.';
        this.loading = false;
      }
    });
  }

  // Дополнительный метод валидации email
  private isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }
}
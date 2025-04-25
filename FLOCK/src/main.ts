import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { Router } from '@angular/router';

bootstrapApplication(AppComponent, appConfig)
  .then(ref => {
    // Используем для отладки маршрутизации
    const router = ref.injector.get(Router);
    console.log('Доступные маршруты:', router.config);
  })
  .catch((err) => console.error('Ошибка при инициализации приложения:', err));

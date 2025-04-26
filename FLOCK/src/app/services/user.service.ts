import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { User } from '../models/models';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getUserProfile(): Observable<User> {
    if (this.isBrowser) {
      return this.http.get<User>(`${environment.apiUrl}/users/profile/`)
        .pipe(
          tap(response => console.log('Профиль успешно загружен', response)),
          catchError((error: HttpErrorResponse) => {
            // Интерцептор обработает 401, здесь просто логируем остальные ошибки
            if (error.status !== 401) {
              console.error('Ошибка загрузки профиля (не 401):', error.status, error.message);
              console.error('Детали ошибки:', error.error);
            }
            // Возвращаем ошибку для дальнейшей обработки (например, в компоненте)
            return throwError(() => new Error(`Ошибка загрузки профиля: ${error.statusText} (${error.status})`));
          })
        );
    }

    console.log('UserService.getUserProfile: Не в браузере, запрос без явного токена.');
    return throwError(() => new Error('Невозможно загрузить профиль вне браузера'));
  }

  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/profile/`, userData);
  }

  updateProfilePicture(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('profile_picture', file);

    return this.http.patch<User>(`${environment.apiUrl}/users/profile/picture/`, formData);
  }

  // Для получения рекомендаций пользователей (для свайпов)
  getUserRecommendations(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users/recommendations/`);
  }
}
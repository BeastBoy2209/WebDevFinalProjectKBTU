import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Define interfaces for type safety
export interface User {
  id: number;
  email: string;
  fullName?: string;
  profileImage?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Обновленный метод логина с корректным URL (без завершающего слеша)
  login(email: string, password: string): Observable<AuthResponse> {
    // Очищаем существующие токены перед логином
    this.clearAuthData();
    
    // Добавляем заголовки для решения проблем CORS
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }, { headers })
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  register(userData: any): Observable<AuthResponse> {
    // Очищаем существующие токены перед регистрацией
    this.clearAuthData();
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  logout(): void {
    this.clearAuthData();
  }

  // Метод для очистки данных авторизации
  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private handleAuthentication(response: AuthResponse): void {
    if (response && response.token) {
      console.log('Получен токен авторизации');
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.userKey, JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    } else {
      console.error('Ошибка в формате ответа авторизации:', response);
    }
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem(this.userKey);
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch (e) {
        console.error('Ошибка при парсинге данных пользователя:', e);
        return null;
      }
    }
    return null;
  }
}
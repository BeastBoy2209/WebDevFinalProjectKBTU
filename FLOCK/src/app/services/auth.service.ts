import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { AuthResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();
  
  private apiUrl = environment.apiUrl;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadStoredUser();
    }
  }

  private loadStoredUser() {
    if (this.isBrowser) {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser');
      if (storedToken && storedUser) {
        try {
          this.currentUserSubject.next(JSON.parse(storedUser));
        } catch (error) {
          console.error('Ошибка при загрузке данных пользователя', error);
          this.logout();
        }
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token && this.isBrowser) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            console.log('Токен сохранен:', response.token);
          }
        })
      );
  }

  register(formData: FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, formData).pipe(
      tap(response => {
        if (response && response.token && this.isBrowser) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          console.log('Токен сохранен после регистрации:', response.token);
        }
      })
    );
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Добавляем логи для отладки
    console.log('AuthGuard: проверка авторизации');
    console.log('Токен существует:', !!this.authService.getToken());
    
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('Пользователь авторизован:', isAuthenticated);
    
    if (isAuthenticated) {
      return true;
    }

    console.log('Перенаправление на страницу входа');
    // Простой редирект вместо createUrlTree
    this.router.navigate(['/login']);
    return false;
  }
}
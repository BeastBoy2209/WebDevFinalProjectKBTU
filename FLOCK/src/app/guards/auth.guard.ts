import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private router = inject(Router);
  private authService = inject(AuthService);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    // При SSR всегда предоставляем доступ, проверка будет происходить на клиенте
    if (!this.isBrowser) {
      return true;
    }
    
    const isAuth = this.authService.isAuthenticated();
    
    if (!isAuth) {
      return this.router.createUrlTree(['/login']);
    }
    
    return true;
  }
}
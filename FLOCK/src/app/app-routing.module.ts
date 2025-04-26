import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'swipe',
    loadComponent: () => import('./components/swipe/swipe.component').then(m => m.SwipeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'my-events',
    loadComponent: () => import('./components/my-events/my-events.component').then(m => m.MyEventsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'random-events',
    loadComponent: () => import('./components/random-events/random-events.component').then(m => m.RandomEventsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'badges',
    loadComponent: () => import('./components/badges/badges.component').then(m => m.BadgesComponent),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: 'swipe', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SwipeComponent } from './components/swipe/swipe.component';
import { MyEventsComponent } from './components/my-events/my-events.component';
import { RandomEventsComponent } from './components/random-events/random-events.component';
import { ProfileComponent } from './components/profile/profile.component';
import { BadgesComponent } from './components/badges/badges.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'swipe', component: SwipeComponent, canActivate: [AuthGuard] },
  // Изменяем пути для соответствия ссылкам в header
  { path: 'my-events', component: MyEventsComponent, canActivate: [AuthGuard] },
  { path: 'random-events', component: RandomEventsComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'badges', component: BadgesComponent, canActivate: [AuthGuard] },
  // Редиректим корневой путь на swipe вместо login
  { path: '', redirectTo: 'swipe', pathMatch: 'full' },
  { path: '**', redirectTo: 'swipe' }
];

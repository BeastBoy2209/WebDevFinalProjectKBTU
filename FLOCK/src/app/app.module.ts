import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { SwipeComponent } from './components/swipe/swipe.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RandomEventsComponent } from './components/random-events/random-events.component';
import { MyEventsComponent } from './components/my-events/my-events.component';
import { BadgesComponent } from './components/badges/badges.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

import { AuthGuard } from './guards/auth.guard';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'swipe', component: SwipeComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'events/random', component: RandomEventsComponent, canActivate: [AuthGuard] },
  { path: 'events/my', component: MyEventsComponent, canActivate: [AuthGuard] },
  { path: 'badges', component: BadgesComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  declarations: [
    // No standalone components should be declared here
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    // Import all standalone components
    AppComponent,
    SwipeComponent,
    ProfileComponent,
    RandomEventsComponent,
    MyEventsComponent,
    BadgesComponent,
    LoginComponent,
    RegisterComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
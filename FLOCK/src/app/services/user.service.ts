import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/profile/`);
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
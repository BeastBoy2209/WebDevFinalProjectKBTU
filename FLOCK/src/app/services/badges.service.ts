import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Badge } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BadgesService {
  constructor(private http: HttpClient) { }

  // Получение всех бейджей пользователя
  getUserBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${environment.apiUrl}/badges/my/`);
  }

  // Получение всех доступных бейджей
  getAllBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${environment.apiUrl}/badges/`);
  }
}
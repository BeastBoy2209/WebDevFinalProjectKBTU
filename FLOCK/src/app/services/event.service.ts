import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/models'; // Убедитесь, что модель Event определена в models.ts
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private http: HttpClient) { }

  /**
   * Получает список случайных событий с бэкенда.
   * Убедитесь, что этот URL '/events/random/' соответствует вашему бэкенд маршруту
   */
  getRandomEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${environment.apiUrl}/events/`);
  }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${environment.apiUrl}/events/`);
  }

  getMyEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${environment.apiUrl}/events/my/`);
  }

  createEvent(eventData: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(`${environment.apiUrl}/events/`, eventData);
  }
}

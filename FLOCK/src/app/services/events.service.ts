import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  constructor(private http: HttpClient) { }

  // Получение всех доступных мероприятий
  getRandomEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${environment.apiUrl}/events/`);
  }

  // Получение мероприятий пользователя
  getUserEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${environment.apiUrl}/events/my/`);
  }

  // Получение информации о конкретном мероприятии
  getEvent(eventId: number): Observable<Event> {
    return this.http.get<Event>(`${environment.apiUrl}/events/${eventId}/`);
  }

  // Присоединение к мероприятию
  joinEvent(eventId: number): Observable<Event> {
    return this.http.post<Event>(`${environment.apiUrl}/events/${eventId}/join/`, {});
  }

  // Выход из мероприятия
  leaveEvent(eventId: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/events/${eventId}/leave/`, {});
  }

  // Создание нового мероприятия
  createEvent(eventData: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(`${environment.apiUrl}/events/`, eventData);
  }

  // Удаление мероприятия
  deleteEvent(eventId: number): Observable<void> { // Expect no content on successful delete (204)
    return this.http.delete<void>(`${environment.apiUrl}/events/${eventId}/`);
  }
}
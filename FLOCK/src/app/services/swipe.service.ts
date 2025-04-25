import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SwipeCard } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SwipeService {
  constructor(private http: HttpClient) { }

  // Получение карточек для свайпа
  getSwipeCards(): Observable<SwipeCard[]> {
    return this.http.get<SwipeCard[]>(`${environment.apiUrl}/swipes/cards/`);
  }

  // Отправка лайка
  like(cardId: number, cardType: 'user' | 'event'): Observable<any> {
    return this.http.post(`${environment.apiUrl}/swipes/like/`, {
      card_id: cardId,
      card_type: cardType
    });
  }

  // Отправка дизлайка
  dislike(cardId: number, cardType: 'user' | 'event'): Observable<any> {
    return this.http.post(`${environment.apiUrl}/swipes/dislike/`, {
      card_id: cardId,
      card_type: cardType
    });
  }

  // Получение информации о совпадениях (matches)
  getMatches(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/swipes/matches/`);
  }
}
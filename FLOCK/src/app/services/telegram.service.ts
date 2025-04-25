import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  constructor(private http: HttpClient) { }

  // Получение ссылки на Telegram-чат мероприятия
  getEventChatLink(eventId: number): Observable<{link: string}> {
    return this.http.get<{link: string}>(`${environment.apiUrl}/telegram/event/${eventId}/chat-link/`);
  }

  // Привязка Telegram-аккаунта к профилю пользователя
  linkTelegramAccount(telegramCode: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/telegram/link-account/`, {
      code: telegramCode
    });
  }
}
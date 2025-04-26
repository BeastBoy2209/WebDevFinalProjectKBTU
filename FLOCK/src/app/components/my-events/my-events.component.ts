import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventsService } from '../../services/events.service';
import { Event } from '../../models/models';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.css']
})
export class MyEventsComponent implements OnInit {
  events: Event[] = []; // Добавляем свойство для хранения мероприятий
  isLoading: boolean = true; // Добавляем флаг загрузки
  error: string | null = null; // Добавляем свойство для хранения ошибки

  constructor(private eventsService: EventsService) {}

  ngOnInit(): void {
    this.loadUserEvents(); // Вызываем загрузку мероприятий при инициализации
  }

  loadUserEvents(): void {
    this.isLoading = true; // Устанавливаем флаг загрузки
    this.error = null; // Сбрасываем ошибку
    this.eventsService.getUserEvents().subscribe({
      next: (data) => {
        this.events = data; // Сохраняем полученные мероприятия
        this.isLoading = false; // Снимаем флаг загрузки
      },
      error: (err) => {
        console.error('Error fetching user events:', err);
        this.error = 'Не удалось загрузить ваши мероприятия. Попробуйте позже.'; // Устанавливаем сообщение об ошибке
        this.isLoading = false; // Снимаем флаг загрузки
      }
    });
  }

  // Можно добавить другие методы, если они нужны
}

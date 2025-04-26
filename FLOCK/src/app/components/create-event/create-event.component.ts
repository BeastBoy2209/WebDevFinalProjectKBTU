import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Импорт FormsModule для [(ngModel)]
import { CommonModule } from '@angular/common'; // Импорт CommonModule для *ngIf
import { Router } from '@angular/router'; // Импорт Router для перенаправления
import { EventsService } from '../../services/events.service'; // Импорт сервиса
import { Event } from '../../models/models'; // Импорт модели Event
import { HttpErrorResponse } from '@angular/common/http'; // Импортируем HttpErrorResponse

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule], // Добавляем FormsModule и CommonModule
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent {
  eventData: Partial<Event> = {
    topic: '',
    description: '',
    date: '',
    location: ''
  };
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private eventsService: EventsService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const dataToSend: Partial<Event> = { ...this.eventData };
    if (dataToSend.date) {
        try {
            dataToSend.date = new Date(dataToSend.date).toISOString();
        } catch (e) {
            this.errorMessage = 'Неверный формат даты.';
            this.isSubmitting = false;
            return;
        }
    } else {
        this.errorMessage = 'Дата и время обязательны.';
        this.isSubmitting = false;
        return;
    }

    this.eventsService.createEvent(dataToSend).subscribe({
      next: (createdEvent) => {
        this.isSubmitting = false;
        this.successMessage = `Мероприятие "${createdEvent.topic}" успешно создано!`;
        this.eventData = { topic: '', description: '', date: '', location: '' };
      },
      error: (err: HttpErrorResponse) => { // Используем HttpErrorResponse для типизации ошибки
        this.isSubmitting = false;
        console.error('Error creating event:', err);

        if (err.status === 400 && err.error && typeof err.error === 'object') {
            // Обработка ошибок валидации Django REST Framework
            const messages = Object.entries(err.error)
                .map(([key, value]) => {
                    const fieldName = this.getFieldName(key); // Получаем читаемое имя поля
                    const errorText = Array.isArray(value) ? value.join(', ') : value;
                    return `${fieldName}: ${errorText}`;
                })
                .join('\n'); // Соединяем ошибки новой строкой для лучшей читаемости
            this.errorMessage = `Ошибка валидации:\n${messages}`;
        } else if (err.error?.message) {
             this.errorMessage = err.error.message; // Ошибка в поле message
        } else if (err.error?.detail) {
             this.errorMessage = err.error.detail; // Ошибка в поле detail
        } else if (typeof err.error === 'string') {
             this.errorMessage = err.error; // Ошибка - просто строка
        } else {
            this.errorMessage = `Произошла ошибка (${err.status}): ${err.statusText}. Попробуйте снова.`;
        }
      }
    });
  }

  // Вспомогательный метод для получения читаемого имени поля
  private getFieldName(apiFieldName: string): string {
    const fieldMap: { [key: string]: string } = {
      topic: 'Тема',
      description: 'Описание',
      date: 'Дата и время',
      location: 'Место проведения',
      // Добавьте другие поля при необходимости
    };
    return fieldMap[apiFieldName] || apiFieldName;
  }
}

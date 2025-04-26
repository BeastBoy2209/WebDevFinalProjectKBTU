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
  deletingEventId: number | null = null; // Track which event is being deleted

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
        this.error = 'Could not upload your events. Try again later.'; // Устанавливаем сообщение об ошибке
        this.isLoading = false; // Снимаем флаг загрузки
      }
    });
  }

  // Method to handle event deletion
  deleteEvent(eventId: number | undefined): void {
    if (eventId === undefined) {
      console.error('Cannot delete event: Event ID is undefined.');
      return;
    }

    this.deletingEventId = eventId; // Mark event as being deleted (for UI feedback)
    this.error = null; // Clear previous errors

    this.eventsService.deleteEvent(eventId).subscribe({
      next: () => {
        // Remove the event from the local array on successful deletion
        this.events = this.events.filter(event => event.id !== eventId);
        this.deletingEventId = null; // Reset deleting state
        console.log(`Event ${eventId} deleted successfully.`);
        // Optional: Add a success message/toast notification
      },
      error: (err) => {
        console.error(`Error deleting event ${eventId}:`, err);
        this.error = `Could not delete event ${eventId}. Please try again.`;
        this.deletingEventId = null; // Reset deleting state even on error
      }
    });
  }
}

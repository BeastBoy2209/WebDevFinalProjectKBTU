import { Component, OnInit } from '@angular/core';
import { BadgesService } from '../../services/badges.service'; // Импортируем сервис
import { Badge } from '../../models/models'; // Импортируем модель
import { CommonModule } from '@angular/common'; // Импортируем CommonModule для *ngFor

@Component({
  selector: 'app-badges',
  standalone: true, // Указываем, что компонент автономный
  imports: [CommonModule], // Импортируем CommonModule
  templateUrl: './badges.component.html',
  styleUrl: './badges.component.css'
})
export class BadgesComponent implements OnInit {
  badges: Badge[] = []; // Массив для хранения значков
  isLoading: boolean = true; // Флаг загрузки
  error: string | null = null; // Сообщение об ошибке

  constructor(private badgesService: BadgesService) {} // Внедряем сервис

  ngOnInit(): void {
    this.loadBadges(); // Загружаем значки при инициализации
  }

  loadBadges(): void {
    this.isLoading = true;
    this.error = null;
    this.badgesService.getAllBadges().subscribe({
      next: (data) => {
        this.badges = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching badges:', err);
        this.error = 'Не удалось загрузить значки. Попробуйте позже.';
        this.isLoading = false;
      }
    });
  }
}

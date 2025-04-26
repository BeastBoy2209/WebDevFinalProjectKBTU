import { Component, OnInit } from '@angular/core'; // Import OnInit
import { CommonModule } from '@angular/common';
import { EventsService } from '../../services/events.service'; // Import EventsService
import { Event } from '../../models/models'; // Import the shared Event model if available, or adjust interface

@Component({
  selector: 'app-random-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './random-events.component.html',
  styleUrls: ['./random-events.component.css']
})
export class RandomEventsComponent implements OnInit { // Implement OnInit
  events: Event[] = []; // Initialize as empty array
  isLoading: boolean = true; // Add loading state
  error: string | null = null; // Add error state

  // Inject EventsService
  constructor(private eventsService: EventsService) {}

  ngOnInit(): void {
    this.loadRandomEvents(); // Renamed method call
  }

  // Renamed method to reflect its purpose
  loadRandomEvents(): void {
    this.isLoading = true;
    this.error = null;
    // Use getRandomEvents() from EventsService
    this.eventsService.getRandomEvents().subscribe({
      next: (data) => {
        // Assuming the backend /events/random/ endpoint returns events from other users
        this.events = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching random events:', err); // Updated log message
        this.error = 'Could not load events. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}

import { Component, OnInit, inject } from '@angular/core'; // Import OnInit and inject
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service'; // Import the service
import { User } from '../../models/models'; // Import User from models
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse

@Component({
  selector: 'app-swipe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './swipe.component.html',
  styleUrls: ['./swipe.component.css']
})
export class SwipeComponent implements OnInit { // Implement OnInit
  // Inject the UserService
  private userService = inject(UserService);

  users: User[] = []; // Initialize users array
  currentIndex: number = 0;
  isLoading: boolean = true; // Flag for loading state
  errorMessage: string | null = null; // To display potential errors

  ngOnInit(): void {
    this.loadUsers(); // Load users when the component initializes
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    // Используем правильное имя метода из UserService
    this.userService.getUserRecommendations().subscribe({
      next: (fetchedUsers: User[]) => {
        this.users = fetchedUsers;
        this.currentIndex = 0;
        this.isLoading = false;
        console.log('Users loaded:', this.users);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading users:', error);
        this.errorMessage = `Failed to load users. ${error.message}`;
        // Optionally display a user-friendly message based on error.status
        this.isLoading = false;
      }
    });
  }

  // Method to handle "like" action
  like(): void {
    const user = this.currentUser;
    if (user) {
      // Используем 'first_name' из модели User
      console.log(`Liking user: ${user.first_name} (ID: ${user.id})`);
      // TODO: Раскомментируйте и реализуйте, когда метод 'like' будет добавлен в UserService
      /*
      this.userService.like(user.id).subscribe({
        next: (response: any) => {
          console.log('Like successful:', response);
          this.nextCard();
        },
        error: (error: HttpErrorResponse) => {
          // Используем 'first_name' из модели User
          console.error(`Error liking user ${user.first_name} (ID: ${user.id}):`, error);
          // Handle error (e.g., show a message to the user)
          // Decide if you still want to advance the card on error
          this.nextCard(); // Advance card even if API call fails for now
        }
      });
      */
      // Пока просто переходим к следующей карточке
      this.nextCard();
    }
  }

  // Method to handle "dislike" action
  dislike(): void {
    const user = this.currentUser;
    if (user) {
      // Используем 'first_name' из модели User
      console.log(`Disliking user: ${user.first_name} (ID: ${user.id})`);
      // TODO: Раскомментируйте и реализуйте, когда метод 'dislike' будет добавлен в UserService
      /*
      this.userService.dislike(user.id).subscribe({
         next: (response: any) => {
          console.log('Dislike successful:', response);
          this.nextCard();
        },
        error: (error: HttpErrorResponse) => {
          // Используем 'first_name' из модели User
          console.error(`Error disliking user ${user.first_name} (ID: ${user.id}):`, error);
          // Handle error
          this.nextCard(); // Advance card even if API call fails for now
        }
      });
      */
      // Пока просто переходим к следующей карточке
      this.nextCard();
    }
  }

  // Method to move to the next card (no changes needed here)
  private nextCard(): void {
    this.currentIndex++;
  }

  // Helper to get the current user (no changes needed here)
  get currentUser(): User | null {
    return !this.isLoading && this.currentIndex < this.users.length ? this.users[this.currentIndex] : null;
  }
}

import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user: User | null = null;
  isEditing = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isBrowser: boolean;
  
  // Добавляем document для использования его в шаблоне
  document: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.document = document;
    }
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.initForm();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.userService.getUserProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.updateFormWithUserData();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Ошибка загрузки профиля. Пожалуйста, попробуйте позже.';
        this.loading = false;
      }
    });
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: [''],
      bio: [''],
      age: [null, [Validators.min(18), Validators.max(100)]]
    });
  }

  updateFormWithUserData(): void {
    if (this.user) {
      this.profileForm.patchValue({
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        bio: this.user.bio || '',
        age: (this.user as any).age || null
      });
      
      if ((this.user as any).photo) {
        this.imagePreview = (this.user as any).photo;
      }
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.updateFormWithUserData(); // Сбросить изменения при отмене редактирования
    }
  }

  onFileSelected(event: Event): void {
    if (!this.isBrowser) return;
    
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Создать предпросмотр изображения
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) return;
    
    this.loading = true;
    this.userService.updateProfilePicture(this.selectedFile).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.successMessage = 'Фото профиля успешно обновлено!';
        this.selectedFile = null;
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Ошибка загрузки фото. Пожалуйста, попробуйте другой файл.';
        this.loading = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const userData = this.profileForm.value;
    
    this.userService.updateUserProfile(userData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isEditing = false;
        this.successMessage = 'Профиль успешно обновлен!';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Ошибка обновления профиля. Пожалуйста, попробуйте позже.';
        this.loading = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}

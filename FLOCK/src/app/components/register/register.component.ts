import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http'; // Импортируем HttpErrorResponse

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null; // Add the missing imagePreview property

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone // Добавляем NgZone
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      profile_image: [null] // Поле для файла
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.registerForm.patchValue({ profile_image: this.selectedFile }); // Обновляем значение в форме
      
      // Create and set image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
      this.registerForm.patchValue({ profile_image: null });
    }
  }


  onSubmit(): void {
    console.log('Нажата кнопка регистрации');
    if (this.registerForm.invalid) {
      console.log('Форма регистрации невалидна', this.registerForm.errors);
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = new FormData();
    // Добавляем поля в FormData с ключами, ожидаемыми бэкендом
    formData.append('username', this.registerForm.get('username')?.value.trim());
    formData.append('email', this.registerForm.get('email')?.value.trim().toLowerCase());
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('password_confirm', this.registerForm.get('confirmPassword')?.value); // Используем password_confirm
    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile, this.selectedFile.name);
    }

    this.authService.register(formData).subscribe({
      next: (response) => {
        console.log('Успешная регистрация:', response);
        // Перенаправление на страницу входа с параметром
        this.ngZone.run(() => {
           this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Ошибка регистрации:', error);
        this.loading = false; // Устанавливаем loading в false в случае ошибки

        if (error.status === 400 && error.error && typeof error.error === 'object') {
            // Обработка ошибок валидации Django REST Framework
            const messages = Object.entries(error.error)
                .map(([key, value]) => {
                    const fieldName = this.getFieldName(key);
                    const errorText = Array.isArray(value) ? value.join(', ') : value;
                    // Исключаем общие ошибки non_field_errors из имени поля
                    return key === 'non_field_errors' ? errorText : `${fieldName}: ${errorText}`;
                })
                .join('\n');
            this.errorMessage = `Ошибка валидации:\n${messages}`;
        } else if (error.status === 409) {
          this.errorMessage = error.error?.message || 'Пользователь с таким email уже существует.';
        } else {
          this.errorMessage = error.error?.message || `Произошла ошибка (${error.status}). Пожалуйста, попробуйте позже.`;
        }
      },
      complete: () => {
        // complete вызывается после next или error, поэтому loading лучше сбрасывать там
        // this.loading = false;
      }
    });
  }

  // Вспомогательный метод для отметки всех полей формы как затронутых
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) { // Рекурсивно для вложенных групп, если будут
        this.markFormGroupTouched(control);
      }
    });
  }

  // Получение названия поля для ошибок
  private getFieldName(apiFieldName: string): string {
    const fieldMap: {[key: string]: string} = {
      username: 'Имя пользователя',
      email: 'Email',
      password: 'Пароль',
      password_confirm: 'Подтверждение пароля',
      profile_image: 'Изображение профиля',
      non_field_errors: 'Общая ошибка' // Для ошибок, не связанных с полем
    };
    return fieldMap[apiFieldName] || apiFieldName;
  }
}
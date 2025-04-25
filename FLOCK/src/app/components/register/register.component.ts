import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

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
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('username', this.registerForm.get('username')?.value.trim());
    formData.append('email', this.registerForm.get('email')?.value.trim().toLowerCase());
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('password_confirm', this.registerForm.get('confirmPassword')?.value);
    
    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile);
    }

    this.authService.register(formData).subscribe({
      next: (response) => {
        console.log('Успешная регистрация', response);
        // Navigate to login after successful registration
        this.router.navigate(['/login'], { 
          queryParams: { registered: 'true' } 
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Ошибка регистрации:', error);
        
        if (error.status === 400) {
          // Обработка ошибок валидации с сервера
          const serverErrors = error.error;
          if (typeof serverErrors === 'object') {
            let errorMessages: string[] = [];
            
            // Обработка разных форматов ошибок от сервера
            Object.keys(serverErrors).forEach(key => {
              const errorField = key;
              const errorValue = serverErrors[key];
              
              if (Array.isArray(errorValue)) {
                errorMessages.push(`${this.getFieldName(errorField)}: ${errorValue.join(', ')}`);
              } else if (typeof errorValue === 'string') {
                errorMessages.push(`${this.getFieldName(errorField)}: ${errorValue}`);
              }
            });
            
            if (errorMessages.length > 0) {
              this.errorMessage = errorMessages.join('\n');
            } else {
              this.errorMessage = 'Ошибка валидации формы. Пожалуйста, проверьте ваши данные.';
            }
          } else {
            this.errorMessage = error.error?.message || 'Ошибка регистрации. Пожалуйста, проверьте ваши данные.';
          }
        } else if (error.status === 409) {
          this.errorMessage = 'Пользователь с таким email или именем уже существует.';
        } else {
          this.errorMessage = 'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.';
        }
        
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  // Вспомогательный метод для отметки всех полей формы как затронутых
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }
  
  // Получение названия поля для ошибок
  private getFieldName(fieldName: string): string {
    const fieldMap: {[key: string]: string} = {
      username: 'Имя пользователя',
      email: 'Email',
      password: 'Пароль',
      password_confirm: 'Подтверждение пароля',
      profile_image: 'Изображение профиля'
    };
    
    return fieldMap[fieldName] || fieldName;
  }
}
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.isLoading) {
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('authToken', res?.token ?? '');
        if (res?.locations) {
          localStorage.setItem('userLocations', JSON.stringify(res.locations));
        }
        this.router.navigate(['/purchase-bill']);
      },
      error: (err) => {
        this.isLoading = false;

        if (err?.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err?.status === 0) {
          this.errorMessage = 'Cannot reach the server. Please check your connection.';
        } else {
          this.errorMessage = 'Invalid credentials or connection error. Please try again.';
        }

        console.error('Login error:', err);

        // This forces the UI to immediately display the error message
        this.cdr.detectChanges();
      }
    });
  }
}

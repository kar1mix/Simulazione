import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">🏓</span>
            <h1>Approvazione Richieste di Acquisto</h1>
          </div>
          <h2>Accedi al tuo account</h2>
        </div>
        <div class="login-form">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" required />
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')"
                >Email è obbligatoria</mat-error
              >
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')"
                >Formato email non valido</mat-error
              >
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                type="password"
                required
              />
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')"
                >Password è obbligatoria</mat-error
              >
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="loginForm.invalid"
            >
              Login
            </button>
          </form>
        </div>
        <div class="login-footer">
          <p>
            Non hai un account?
            <a (click)="goToRegister()" class="register-link">Registrati</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .login-card {
        background: white;
        border-radius: 20px;
        padding: 40px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .login-header {
        text-align: center;
        margin-bottom: 30px;
      }

      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 20px;
      }

      .logo-icon {
        font-size: 32px;
      }

      .logo h1 {
        margin: 0;
        color: #333;
        font-size: 24px;
        font-weight: 600;
      }

      .login-header h2 {
        margin: 0;
        color: #666;
        font-size: 16px;
        font-weight: 400;
      }

      .login-form {
        margin-bottom: 20px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 20px;
      }

      .login-footer {
        text-align: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }

      .login-footer p {
        margin: 0;
        color: #666;
      }

      .register-link {
        color: #1976d2;
        cursor: pointer;
        text-decoration: none;
        font-weight: 500;
      }

      .register-link:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login({ email, password }).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.snackBar.open(error.error.message || 'Login fallito', 'Chiudi', {
            duration: 3000,
          });
        },
      });
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}

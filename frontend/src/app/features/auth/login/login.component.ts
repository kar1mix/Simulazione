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
      <mat-card>
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
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
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="goToRegister()">Registrati</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f5f5f5;
      }
      mat-card {
        max-width: 400px;
        width: 100%;
        margin: 2em;
        padding: 2em;
      }
      .full-width {
        width: 100%;
        margin-bottom: 1em;
      }
      mat-card-actions {
        display: flex;
        justify-content: center;
        padding: 1em;
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
      this.authService.login(email, password).subscribe({
        next: (response) => {
          const role = response.ruolo;
          this.router.navigate([`/dashboard/${role}`]);
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

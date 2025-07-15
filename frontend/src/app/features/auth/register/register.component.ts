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
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <div class="logo">
            <span class="logo-icon">🛒</span>
            <h1>Approvazione Richieste di Acquisto</h1>
          </div>
          <h2>Crea il tuo account</h2>
        </div>
        <div class="register-form">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="nome" required />
              <mat-error *ngIf="registerForm.get('nome')?.hasError('required')"
                >Nome è obbligatorio</mat-error
              >
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cognome</mat-label>
              <input matInput formControlName="cognome" required />
              <mat-error
                *ngIf="registerForm.get('cognome')?.hasError('required')"
                >Cognome è obbligatorio</mat-error
              >
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" required />
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')"
                >Email è obbligatoria</mat-error
              >
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')"
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
              <mat-error
                *ngIf="registerForm.get('password')?.hasError('required')"
                >Password è obbligatoria</mat-error
              >
              <mat-error
                *ngIf="registerForm.get('password')?.hasError('minlength')"
                >Password troppo corta (min 6 caratteri)</mat-error
              >
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Ruolo</mat-label>
              <mat-select formControlName="ruolo" required>
                <mat-option value="Dipendente">Dipendente</mat-option>
                <mat-option value="Responsabile">Responsabile</mat-option>
              </mat-select>
              <mat-error *ngIf="registerForm.get('ruolo')?.hasError('required')"
                >Ruolo obbligatorio</mat-error
              >
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="registerForm.invalid"
            >
              Registrati
            </button>
          </form>
        </div>
        <div class="register-footer">
          <p>
            Hai già un account?
            <a (click)="goToLogin()" class="login-link">Accedi</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .register-container {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .register-card {
        background: white;
        border-radius: 20px;
        padding: 40px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .register-header {
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

      .register-header h2 {
        margin: 0;
        color: #666;
        font-size: 16px;
        font-weight: 400;
      }

      .register-form {
        margin-bottom: 20px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 20px;
      }

      .register-footer {
        text-align: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }

      .register-footer p {
        margin: 0;
        color: #666;
      }

      .login-link {
        color: #1976d2;
        cursor: pointer;
        text-decoration: none;
        font-weight: 500;
      }

      .login-link:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      ruolo: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { nome, cognome, email, password, ruolo } = this.registerForm.value;
      this.authService
        .register({ nome, cognome, email, password, ruolo })
        .subscribe({
          next: (response) => {
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.snackBar.open(
              error.error.message || 'Registrazione fallita',
              'Chiudi',
              {
                duration: 3000,
              }
            );
          },
        });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

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
    MatSelectModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="register-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Registrazione</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="nome" required />
              <mat-error *ngIf="registerForm.get('nome')?.hasError('required')"
                >Nome è obbligatorio</mat-error
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
                <mat-option value="dipendente">Dipendente</mat-option>
                <mat-option value="organizzatore">Organizzatore</mat-option>
              </mat-select>
              <mat-error *ngIf="registerForm.get('ruolo')?.hasError('required')"
                >Ruolo è obbligatorio</mat-error
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
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="goToLogin()">Torna al Login</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .register-container {
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      ruolo: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { nome, email, password, ruolo } = this.registerForm.value;
      this.authService.register(nome, email, password, ruolo).subscribe({
        next: (response) => {
          const role = response.ruolo;
          this.router.navigate([`/dashboard/${role}`]);
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

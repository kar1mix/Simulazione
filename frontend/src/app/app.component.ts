import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-toolbar color="primary" *ngIf="authService.isAuthenticated()">
      <span>Gestione Eventi Aziendali</span>
      <span class="spacer"></span>
      <button mat-button (click)="authService.logout()">
        <mat-icon>exit_to_app</mat-icon>
        Logout
      </button>
    </mat-toolbar>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      .spacer {
        flex: 1 1 auto;
      }
      main {
        padding: 20px;
      }
    `,
  ],
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}

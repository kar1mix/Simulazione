import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Gestione Eventi Aziendali</span>
      <span class="spacer"></span>
      <ng-container *ngIf="authService.isAuthenticated()">
        <button
          mat-button
          routerLink="/dashboard/{{ authService.getUserRole() }}"
        >
          <mat-icon>dashboard</mat-icon>
          Dashboard
        </button>
        <button
          mat-button
          routerLink="/statistiche"
          *ngIf="authService.getUserRole() === 'organizzatore'"
        >
          <mat-icon>bar_chart</mat-icon>
          Statistiche
        </button>
        <button mat-button (click)="authService.logout()">
          <mat-icon>exit_to_app</mat-icon>
          Logout
        </button>
      </ng-container>
    </mat-toolbar>
  `,
  styles: [
    `
      .spacer {
        flex: 1 1 auto;
      }
      button {
        margin: 0 8px;
      }
      mat-icon {
        margin-right: 4px;
      }
    `,
  ],
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
}

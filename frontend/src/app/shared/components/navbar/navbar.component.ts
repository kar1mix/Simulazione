import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav
      class="modern-navbar animate-fade-in"
      aria-label="Barra di navigazione principale"
    >
      <div class="navbar-container">
        <div class="navbar-brand">
          <span class="brand-icon">🛒</span>
          <span class="brand-text">Approvazione Richieste di Acquisto</span>
        </div>

        <div class="navbar-menu">
          <ng-container *ngIf="authService.isAuthenticated()">
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              class="nav-link"
            >
              <span class="nav-icon">📋</span>
              <span class="nav-text">Dashboard</span>
            </a>
            <button (click)="logout()" class="nav-button logout-btn">
              <span class="nav-icon">🚪</span>
              <span class="nav-text">Logout</span>
            </button>
          </ng-container>

          <ng-container *ngIf="!authService.isAuthenticated()">
            <a routerLink="/login" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">🔑</span>
              <span class="nav-text">Login</span>
            </a>
            <a
              routerLink="/register"
              routerLinkActive="active"
              class="nav-link"
            >
              <span class="nav-icon">👤</span>
              <span class="nav-text">Registrati</span>
            </a>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .modern-navbar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .navbar-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 70px;
      }

      .navbar-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: transform 0.3s ease;
      }

      .navbar-brand:hover {
        transform: scale(1.05);
      }

      .brand-icon {
        font-size: 32px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      }

      .brand-text {
        font-size: 20px;
        font-weight: 700;
        color: #fff;
        letter-spacing: 0.5px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .navbar-menu {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        color: #fff;
        text-decoration: none;
        font-weight: 500;
        border-radius: 12px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .nav-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.1),
          transparent
        );
        transition: left 0.5s ease;
      }

      .nav-link:hover::before {
        left: 100%;
      }

      .nav-link:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .nav-link.active {
        background: rgba(255, 255, 255, 0.2);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .nav-icon {
        font-size: 18px;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
      }

      .nav-text {
        font-size: 14px;
        font-weight: 600;
      }

      .nav-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
      }

      .nav-button:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .logout-btn {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        border: none;
      }

      .logout-btn:hover {
        background: linear-gradient(135deg, #ff5252 0%, #d84315 100%);
      }

      @media (max-width: 768px) {
        .navbar-container {
          padding: 0 15px;
        }

        .brand-text {
          font-size: 16px;
        }

        .nav-text {
          display: none;
        }

        .nav-link,
        .nav-button {
          padding: 10px 15px;
        }
      }

      /* Animazione, focus, hover */
      .animate-fade-in {
        animation: fadeIn 0.7s;
      }
      .nav-link,
      .nav-button {
        transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
        outline: none;
      }
      .nav-link:focus,
      .nav-button:focus {
        box-shadow: 0 0 0 3px #b3c6ff;
        border-color: #667eea;
      }
      .nav-link:hover,
      .nav-button:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
      }
    `,
  ],
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}

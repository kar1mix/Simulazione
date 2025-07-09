import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      }

      .main-content {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
        min-height: calc(100vh - 64px);
      }

      @media (max-width: 768px) {
        .main-content {
          padding: 10px;
        }
      }
    `,
  ],
})
export class AppComponent {}

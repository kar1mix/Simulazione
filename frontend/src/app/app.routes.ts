import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'statistiche',
    loadChildren: () =>
      import('./features/statistiche/statistiche-module').then(
        (m) => m.StatisticheModule
      ),
    canActivate: [
      () => import('./core/guards/role.guard').then((m) => m.roleGuard),
    ],
    data: { roles: ['Responsabile'] },
  },
  { path: '**', redirectTo: '/login' },
];

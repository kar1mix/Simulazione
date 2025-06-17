import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DipendenteComponent } from './features/dashboard/dipendente/dipendente.component';
import { OrganizzatoreComponent } from './features/dashboard/organizzatore/organizzatore.component';
import { StatisticheComponent } from './features/statistiche/statistiche.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard/dipendente',
    component: DipendenteComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'dipendente' },
  },
  {
    path: 'dashboard/organizzatore',
    component: OrganizzatoreComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'organizzatore' },
  },
  {
    path: 'statistiche',
    component: StatisticheComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'organizzatore' },
  },
  { path: '**', redirectTo: '/login' },
];

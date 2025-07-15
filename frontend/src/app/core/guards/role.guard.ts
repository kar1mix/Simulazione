import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'] as 'Dipendente' | 'Responsabile';
  const userRole = authService.getUserRole();

  if (!userRole) {
    return router.parseUrl('/login');
  }

  if (userRole === requiredRole) {
    return true;
  }

  // Reindirizza alla dashboard appropriata in base al ruolo
  return router.parseUrl(`/dashboard/${userRole.toLowerCase()}`);
};

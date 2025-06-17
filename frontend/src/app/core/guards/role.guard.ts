import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'];

  if (authService.getUserRole() === requiredRole) {
    return true;
  }

  // Reindirizza alla dashboard appropriata in base al ruolo
  const role = authService.getUserRole();
  return router.parseUrl(`/dashboard/${role}`);
};

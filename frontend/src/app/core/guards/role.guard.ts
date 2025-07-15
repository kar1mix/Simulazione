import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userRole = authService.getUserRole();

  // Supporta sia 'role' (stringa) che 'roles' (array)
  const requiredRole = route.data['role'] as string | undefined;
  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (!userRole) {
    return router.parseUrl('/login');
  }

  if (
    (requiredRole && userRole === requiredRole) ||
    (requiredRoles && requiredRoles.includes(userRole))
  ) {
    return true;
  }

  // Reindirizza alla dashboard appropriata in base al ruolo
  return router.parseUrl(`/dashboard/${userRole.toLowerCase()}`);
};

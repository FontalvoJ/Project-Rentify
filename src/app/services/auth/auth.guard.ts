import { CanActivateFn, CanActivateChildFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Guard que protege rutas y rutas hijas según autenticación y roles
 */
export const authGuard: CanActivateFn & CanActivateChildFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Roles permitidos para esta ruta
  const expectedRoles = route.data['roles'] as string[] | undefined;

  // Usuario no logueado
  if (!authService.isLoggedIn()) {
    router.navigate(['/sign-in']);
    return false;
  }

  // Usuario logueado pero rol no permitido
  if (expectedRoles && !expectedRoles.includes(authService.getUserRole()!)) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
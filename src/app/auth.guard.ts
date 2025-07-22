import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth/auth.service';


export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

 
  if (authService.loggedIn()) {
    return true; 
  } else {
   
    router.navigate(['/sign-in']);
    return false
  }
};

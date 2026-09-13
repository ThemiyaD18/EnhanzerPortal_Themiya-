import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Check if the session exists in local storage
  if (localStorage.getItem('isLoggedIn') === 'true') {
    return true; // Allow access
  }

  // If no session, redirect to login page
  router.navigate(['/']);
  return false;
};

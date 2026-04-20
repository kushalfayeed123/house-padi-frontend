import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from '../store/auth.store';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    const role = authStore.user()?.role; // Assuming user() signal exists in AuthStore

    // Role-based redirection logic
    if (role === 'owner') {
      return router.parseUrl('/dashboard/host');
    } else if (role === 'renter') {
      return router.parseUrl('/dashboard/tenant');
    }
    
    // Fallback for admin or undefined roles
    return router.parseUrl('/'); 
  }

  return true;
};
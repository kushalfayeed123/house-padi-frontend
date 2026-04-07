// src/app/core/guards/guest.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from '../store/auth.store';

/**
 * Prevents authenticated users from accessing guest-only routes (Login/Register)
 */
export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // If the user is already authenticated, send them to the home page
  if (authStore.isAuthenticated()) {
    return router.parseUrl('/'); 
  }

  // Otherwise, allow access to the login/register screens
  return true;
};
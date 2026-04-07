// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take, map } from 'rxjs';

/**
 * Protects private routes by ensuring the user is logged in.
 */
// src/app/core/guards/auth.guard.ts
export const authGuard: CanActivateFn = () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    // If the app isn't ready yet (init still running), we wait.
    // Using toObservable allows the guard to pause until isReady is true.
    return toObservable(authStore.isReady).pipe(
        filter(ready => ready), // Only proceed when init() is done
        take(1),
        map(() => {
            if (authStore.isAuthenticated()) return true;
            return router.parseUrl('/auth/login');
        })
    );
};
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/properties/components/renter-dashboard/renter-dashboard').then(m => m.RenterDashboard)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard], // Prevents logged-in users from seeing login
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
      }
    ]
  },
  {
    path: 'properties',
    children: [
      {
        path: ':id',
        loadComponent: () => import('./features/properties/components/property-details/property-details').then(m => m.PropertyDetails)
      },

      // You can add your 'discover' or 'list' route here later
    ]
  },
  {
    path: 'profile',
    canActivate: [authGuard], // Must be logged in
    children: [
      // {
      //   path: 'kyc',
      //   loadComponent: () => import('./features/profile/kyc-upload/kyc-upload.component').then(m => m.KycUploadComponent)
      // },
      // {
      //   path: 'pending-verification',
      //   loadComponent: () => import('./features/profile/kyc-pending/kyc-pending.component').then(m => m.KycPendingComponent)
      // }
    ]
  },
  // {
  //   path: 'discover',
  //   loadComponent: () => import('./features/properties/property-list/property-list.component').then(m => m.PropertyListComponent)
  // },
  // Fallback
  { path: '**', redirectTo: '' }

];

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'House Padi | Find Your Next Home',
    loadComponent: () => import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'renter',
    canActivate: [authGuard],
    loadComponent: () => import('./features/properties/components/renter-dashboard/renter-dashboard').then(m => m.RenterDashboard)
  },
  {
    path: 'owner',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/owner/owner-dashboard/owner-dashboard').then(m => m.OwnerDashboard)
      },
      {
        path: 'properties/new',
        title: 'List New Property | House Padi',
        loadComponent: () => import('./features/owner/add-property/add-property').then(m => m.AddProperty)
      },
      // ADD THIS ROUTE:
      {
        path: 'properties/edit/:id',
        title: 'Edit Property | House Padi',
        loadComponent: () => import('./features/owner/add-property/add-property').then(m => m.AddProperty)
      }
    ]
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
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
      }
    ]
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    children: []
  },
  { path: '**', redirectTo: '' }
];
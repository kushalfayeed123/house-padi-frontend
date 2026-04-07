// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastStore } from '../store/toast.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error (Extract message from your NestJS/Node backend)
        errorMessage = error.error?.message || `Error Code: ${error.status}`;
      }

      console.log(errorMessage)

      toast.show(errorMessage, 'error');
      return throwError(() => error);
    })
  );
};
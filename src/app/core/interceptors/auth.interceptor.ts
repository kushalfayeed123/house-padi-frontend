import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthStore } from "../store/auth.store";

// src/app/core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  
  // Use the signal, but fallback to localStorage for the very first init call
  const token = authStore.token() ?? localStorage.getItem('hp_token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
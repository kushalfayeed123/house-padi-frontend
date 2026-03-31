// src/app/core/store/auth.store.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthResponse, User } from '../../data/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = '/api/v1/auth';

  // --- Private State ---
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('hp_token'));
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // --- Public Selectors (Signals) ---
  readonly user = computed(() => this._user());
  readonly token = computed(() => this._token());
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isLoading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  // --- Actions ---

  /** * Maps to: POST /api/v1/auth/register
   * Expects: RegisterDto { email, password, firstName, lastName, role, phoneNumber? }
   */
  async register(dto: any) {
    this.setLoading(true);
    try {
      // Per Swagger: Returns 201 on success
      await firstValueFrom(this.http.post(`${this.API_URL}/register`, dto));
      
      // Navigate to login with a success message or auto-login
      this.router.navigate(['/auth/login'], { queryParams: { registered: 'true' } });
    } catch (err: any) {
      this._error.set(err.error?.message || 'Registration failed. Please try again.');
      throw err; // Allow component to handle specific local errors if needed
    } finally {
      this.setLoading(false);
    }
  }

  /** * Maps to: POST /api/v1/auth/login
   * Expects: LoginDto { email, password }
   */
  async login(dto: any) {
    this.setLoading(true);
    try {
      const res = await firstValueFrom(this.http.post<AuthResponse>(`${this.API_URL}/login`, dto));
      
      // Save session
      localStorage.setItem('hp_token', res.accessToken);
      this._token.set(res.accessToken);
      this._user.set(res.user);

      // Redirect to home or intended destination
      this.router.navigate(['/']);
    } catch (err: any) {
      this._error.set(err.error?.message || 'Invalid email or password.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Clears state and local storage
   */
  logout() {
    localStorage.removeItem('hp_token');
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/']);
  }

  // --- Helper ---
  private setLoading(val: boolean) {
    this._loading.set(val);
    if (val) this._error.set(null); // Clear errors when a new attempt starts
  }
}
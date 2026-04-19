// src/app/core/store/auth.store.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { KycStatus, User } from '../../data/models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('hp_token'));
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _isReady = signal(false);


  readonly isReady = computed(() => this._isReady());
  readonly user = computed(() => this._user());
  readonly token = computed(() => this._token());
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isLoading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  /**
   * Helper to transform raw API/Supabase user to our Clean User Interface
   */
  private mapUser(raw: any): User {
    return {
      id: raw.id,
      email: raw.email,
      // Mapping snake_case metadata to our camelCase interface
      firstName: raw.first_name || raw.email.split('@')[0],
      lastName: raw.last_name || '',
      // Default to renter if metadata is missing
      role: raw.role || 'renter',
      avatarUrl: raw.avatar_url,
      kycStatus: raw.kycStatus,
      createdAt: raw.createdAt
    };
  }

  async init() {
    const token = localStorage.getItem('hp_token');
    if (!token) return; // Resolves immediately for guests

    try {
      // We return this call so the initializer waits for the network
      const rawProfile = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/profiles/me`)
      );
      this._user.set(this.mapUser(rawProfile));
      this._isReady.set(true);
    } catch (err) {
      this.logout();
    }
  }

  async login(dto: any, returnUrl: string = '/') {
    this.setLoading(true);
    try {
      const res = await firstValueFrom(
        this.http.post<{ access_token: string; user: any }>(`${this.API_URL}/login`, dto)
      );

      localStorage.setItem('hp_token', res.access_token);
      this._token.set(res.access_token);
      this.init();
      // Navigate to the returnUrl or home if not provided
      this.router.navigateByUrl(returnUrl);
    } catch (err: any) {
      this._error.set(err.error?.message || 'Invalid email or password.');
    } finally {
      this.setLoading(false);
    }
  }

  async register(dto: any) {
    this.setLoading(true);
    try {
      await firstValueFrom(this.http.post(`${this.API_URL}/register`, dto));
    } catch (err: any) {
      this._error.set(err.error?.message || 'Registration failed.');
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  logout() {
    localStorage.removeItem('hp_token');
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/']);
  }

  private setLoading(val: boolean) {
    this._loading.set(val);
    if (val) this._error.set(null);
  }
}
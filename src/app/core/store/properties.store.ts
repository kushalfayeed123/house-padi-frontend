// src/app/core/store/properties.store.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PropertiesStore {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://house-padi.onrender.com/api/v1/properties';
  private readonly CACHE_KEY = 'hp_featured_cache';

  // --- State ---
  private _list = signal<any[]>([]);
  private _loading = signal(false);
  private _selectedProperty = signal<any | null>(null);

  constructor() {
    // Phase 1: Immediate hydration from local storage
    this.hydrateFromCache();
  }

  // --- Selectors ---
  readonly allProperties = computed(() => this._list());
  readonly isLoading = computed(() => this._loading());
  readonly selected = computed(() => this._selectedProperty());

  // --- Actions ---

  private hydrateFromCache() {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        // Set the list immediately so the UI isn't empty while waiting for API
        this._list.set(data);
      } catch (e) {
        console.error('Cache hydration failed', e);
      }
    }
  }

  async fetch(isFeatured: boolean, limit?: number) {
    this._loading.set(true);
    try {
      let params = new HttpParams();
      if (limit) params = params.set('limit', limit);
      let path = isFeatured ? 'featured' : ''
      const data = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/${path}`, { params }));

      // Phase 2: Update the signal with fresh data
      this._list.set(data);

      // Phase 3: Update Cache (only store featured items to save space)
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));

    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      this._loading.set(false);
    }
  }
  /** AI Hybrid Search (PropertiesController_search) */
  async search(query: string) {
    this._loading.set(true);
    try {
      const params = new HttpParams().set('chatPrompt', query);
      const res = await firstValueFrom(this.http.get<any>(`${this.API_URL}/search`, { params }));

      // If the API returns results in an object (as per your swagger 'type: object'),
      // adjust this to map the results array
      this._list.set(res.results || res);
    } finally {
      this._loading.set(false);
    }
  }

  /** Single Property (PropertiesController_findOne) */
  async fetchById(id: string) {
    this._loading.set(true);
    try {
      const data = await firstValueFrom(this.http.get<any>(`${this.API_URL}/${id}`));
      this._selectedProperty.set(data);
    } finally {
      this._loading.set(false);
    }
  }
}
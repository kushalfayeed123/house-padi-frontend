// src/app/core/store/properties.store.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Property } from '../../data/models/property.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PropertiesStore {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/properties`;

  // --- State ---
  private _featuredList = signal<any[]>([]); // Always holds featured items
  private _searchList = signal<any[]>([]);   // Only holds AI search results
  private _loading = signal(false);
  private _isTyping = signal(false);
  private _fullAiSummary = '';
  private _displayedAiSummary = signal('');
  private _selectedProperty = signal<Property | null>(null); // State for Details Page

  // --- Selectors ---
  readonly featuredProperties = computed(() => this._featuredList());
  readonly searchResults = computed(() => this._searchList());
  readonly isLoading = computed(() => this._loading());
  readonly isTyping = computed(() => this._isTyping());
  readonly displayedAiSummary = computed(() => this._displayedAiSummary());
  readonly selectedProperty = computed(() => this._selectedProperty());



  /**
   * Fetch a single property for the Details Page
   */
  async fetchPropertyById(id: string) {
    this._loading.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<Property>(`${this.API_URL}/${id}`)
      );
      this._selectedProperty.set(data);
    } catch (error) {
      this._selectedProperty.set(null);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async fetchFeatured(limit: number = 12) {
    this._loading.set(true);
    try {
      const params = new HttpParams().set('limit', limit);
      const data = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/featured`, { params }));
      this._featuredList.set(data);
    } finally {
      this._loading.set(false);
    }
  }

  async search(query: string) {
    if (!query.trim()) return;
    this._loading.set(true);
    this._displayedAiSummary.set('');
    this._isTyping.set(true);

    try {
      const params = new HttpParams().set('chatPrompt', query);
      const res = await firstValueFrom(this.http.get<any>(`${this.API_URL}/search`, { params }));

      this._searchList.set(res.data || []); // Updates ONLY the search list
      this._fullAiSummary = res.padi_summary || '';
      this._loading.set(false);
      this.typeEffect();
    } catch (error) {
      this._loading.set(false);
      this._isTyping.set(false);
    }
  }

  private typeEffect() {
    let i = 0;
    const interval = setInterval(() => {
      if (i < this._fullAiSummary.length) {
        this._displayedAiSummary.update(v => v + this._fullAiSummary.charAt(i));
        i++;
      } else {
        this._isTyping.set(false);
        clearInterval(interval);
      }
    }, 25);
  }

  clearSelected() {
    this._selectedProperty.set(null);
  }
}
// src/app/core/store/properties.store.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { Property } from '../../data/models/property.model';
import { environment } from '../../../environments/environment';
import { PropertyListingPayload } from '../../data/dtos/property-listing.dto';

@Injectable({ providedIn: 'root' })
export class PropertiesStore {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/properties`;
  private readonly NEWS_API_URL = `${environment.apiUrl}/news`;

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

  createListing(dto: PropertyListingPayload, images: File[]): Observable<any> {
    const formData = new FormData();

    formData.append('title', dto.title);
    formData.append('price', dto.price.toString());
    formData.append('location', dto.location);
    formData.append('addressFull', dto.addressFull || 'N/A');
    formData.append('description', dto.description || '');
    formData.append('leaseDurationMonths', dto.leaseDurationMonths.toString());
    formData.append('agreementContent', dto.agreementContent || 'Standard Agreement');

    if (dto.lat) formData.append('lat', dto.lat.toString());
    if (dto.lng) formData.append('lng', dto.lng.toString());

    formData.append('features', JSON.stringify(dto.features));

    // FIX: Change 'images' to 'files' so NestJS @UploadedFiles() sees them
    images.forEach((file) => {
      formData.append('files', file, file.name);
    });

    return this.http.post(this.API_URL, formData);
  }

  // owner-properties.service.ts

  // property.service.ts
  updateProperty(id: string, dto: any, files: File[]): Observable<any> {
    const formData = new FormData();

    // 1. Append standard fields
    Object.keys(dto).forEach(key => {
      if (key !== 'images' && key !== 'features' && dto[key] !== undefined) {
        formData.append(key, dto[key]);
      }
    });

    // 2. Append Features (JSON stringify for JSONB fields)
    if (dto.features) {
      formData.append('features', JSON.stringify(dto.features));
    }

    // 3. Append Existing Images (The "Keep" list)
    if (dto.images && dto.images.length > 0) {
      dto.images.forEach((url: string) => {
        formData.append('images', url); // NestJS will pick this up as an array
      });
    } else {
      // If all existing images were removed, send an empty indicator if needed
      // or simply don't append, and the DTO @Transform will handle the empty array
    }

    // 4. Append New Files
    files.forEach(file => {
      formData.append('files', file, file.name);
    });

    return this.http.patch(`${this.API_URL}/${id}`, formData);
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Inside your PropertiesStore or a new NewsStore
  newsArticles = signal<any[]>([]);

  // Inside your PropertiesStore


  async fetchMarketNews() {
    // Point this to your local NestJS server or production domain
    const url = `${this.NEWS_API_URL}/housing`;

    try {
      const res = await fetch(url);
      const articles = await res.json();

      const mapped = articles.map((a: any) => ({
        ...a,
        category: this.detectCategory(a.title),
        sourceName: a.source.name
      }));

      this.newsArticles.set(mapped);
    } catch (e) {
      console.error("Fetch failed", e);
    }
  }

  // Simple logic to give that "AI Tagged" feel to the home seeker
  detectCategory(text: string): string {
    const t = text.toLowerCase();
    if (t.includes('price') || t.includes('rent') || t.includes('cost')) return 'Pricing';
    if (t.includes('security') || t.includes('safe') || t.includes('police')) return 'Security';
    if (t.includes('new') || t.includes('launch') || t.includes('future')) return 'Development';
    return 'Market Trend';
  }
}
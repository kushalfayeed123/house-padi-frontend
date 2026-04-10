// src/app/core/store/renting.store.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Application, Lease, PaymentCompleteDto } from '../../data/models/renting.model';
import { environment } from '../../../environments/environment';
import { MyApplication } from '../../features/properties/interfaces/application.interface';

@Injectable({ providedIn: 'root' })
export class RentingStore {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/renting`;

    // State
    applications = signal<MyApplication[]>([]); // New signal for list
    currentApplication = signal<Application | null>(null);
    currentLease = signal<Lease | null>(null);
    loading = signal(false);

    /**
     * Fetch all applications for the current user
     */
    async fetchMyApplications() {
        this.loading.set(true);
        try {
            // Using the endpoint you provided earlier
            const res = await firstValueFrom(
                this.http.get<MyApplication[]>(`${this.API_URL}/my-applications`)
            );
            this.applications.set(res);
            return res;
        } catch (error) {
            console.error('Error fetching applications:', error);
            throw error;
        } finally {
            this.loading.set(false);
        }
    }

    async applyForProperty(propertyId: string, tourDate?: string) {
        this.loading.set(true);
        try {
            const payload = { propertyId, preferredTourDate: tourDate };
            const res = await firstValueFrom(
                this.http.post<Application>(`${this.API_URL}/interest`, payload)
            );
            this.currentApplication.set(res);
            return res;
        } finally {
            this.loading.set(false);
        }
    }

    async finalizePayment(data: PaymentCompleteDto) {
        return firstValueFrom(
            this.http.post(`${this.API_URL}/webhook/payment-complete`, data)
        );
    }
}
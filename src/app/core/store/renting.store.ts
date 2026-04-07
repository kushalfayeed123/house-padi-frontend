// src/app/core/store/renting.store.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Application, Lease, InterestDto, PaymentCompleteDto } from '../../data/models/renting.model';

@Injectable({ providedIn: 'root' })
export class RentingStore {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://house-padi.onrender.com/api/v1/renting';

    // State
    currentApplication = signal<Application | null>(null);
    currentLease = signal<Lease | null>(null);
    loading = signal(false);

    async applyForProperty(propertyId: string, tourDate?: string) {
        this.loading.set(true);
        try {
            const payload = { propertyId, preferredTourDate: tourDate };
            const res = await firstValueFrom(
                this.http.post<any>(`${this.API_URL}/interest`, payload)
            );
            this.currentApplication.set(res);
            return res;
        } finally {
            this.loading.set(false);
        }
    }

    async initiateLease(applicationId: string, renterId: string): Promise<Lease> {
        this.loading.set(true);
        try {
            // POST /api/v1/renting/application/{id}/generate-lease/{renterId}
            const res = await firstValueFrom(
                this.http.post<Lease>(`${this.API_URL}/application/${applicationId}/generate-lease/${renterId}`, {})
            );
            this.currentLease.set(res);
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
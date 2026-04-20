import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

// Standardized Interface based on your Backend Entities
export interface OwnerDashboardData {
  stats: {
    balance: number;
    totalProperties: number;
    pendingApplications: number;
    activeLeases?: number;
    occupancyRate?: number;
  };
  properties: any[];
  applications: any[];
}

@Injectable({ providedIn: 'root' })
export class OwnerStore {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/owner`;
  private readonly RENTING_API_URL = `${environment.apiUrl}/renting`;

  // State Management
  private _dashboardData = signal<OwnerDashboardData | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Read-only Selectors (Public API)
  public readonly dashboard = this._dashboardData.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();

  // Computed Derived State for Performance
  public readonly walletBalance = computed(() => this._dashboardData()?.stats?.balance ?? 0);
  public readonly properties = computed(() => this._dashboardData()?.properties ?? []); public readonly applications = computed(() => this._dashboardData()?.applications ?? []);
  public readonly totalProperties = computed(() => this._dashboardData()?.stats?.totalProperties ?? 0);
  public readonly pendingApplications = computed(() => this._dashboardData()?.stats?.pendingApplications ?? 0);

  /**
   * Initializes the dashboard state.
   * Leverages the aggregated summary endpoint for minimal network overhead.
   */
  async initDashboard() {
    this._loading.set(true);
    this._error.set(null);

    try {
      const data = await firstValueFrom(
        this.http.get<OwnerDashboardData>(`${this.API_URL}/dashboard`)
      );
      this._dashboardData.set(data);
    } catch (err: any) {
      this._error.set(err.message || 'Failed to load dashboard data');
      console.error('[OwnerStore] initDashboard Error:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Updates an application status (Approve/Reject).
   * After success, it re-initializes to sync the Wallet balance and Property status 
   * (since approval triggers Lease preparation and PENDING status on the backend).
   */
  async handleApplicationDecision(id: string, status: 'approved' | 'rejected') {
    try {
      await firstValueFrom(
        this.http.patch(`${this.RENTING_API_URL}/application/${id}/status`, { status })
      );

      // We perform a full refresh because an 'approved' status significantly
      // alters the system state (Property, Wallet, and Application lists change)
      await this.initDashboard();
    } catch (err: any) {
      this._error.set(err.message || 'Failed to update application status');
      throw err; // Allow component to handle local UI feedback (toasts, etc.)
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Optimistic update for local UI responsiveness (Optional)
   * Can be used if you want to remove the application from the list 
   * before the full initDashboard re-fetch completes.
   */
  private updateLocalApplicationStatus(id: string, status: string) {
    const current = this._dashboardData();
    if (!current) return;

    const updatedApps = current.applications.map(app =>
      app.id === id ? { ...app, status } : app
    );

    this._dashboardData.set({
      ...current,
      applications: updatedApps
    });
  }


}
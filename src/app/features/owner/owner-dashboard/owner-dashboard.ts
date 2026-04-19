// src/app/features/owner/owner-dashboard/owner-dashboard.component.ts
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OwnerStore } from '../../../core/store/owner.store';
import { StatsCard } from '../stats-card/stats-card';
import { ApplicationList } from '../application-list/application-list';
import { PropertySidebar } from '../property-sidebar/property-sidebar';
import { Nav } from '../../../shared/components/nav/nav';
import { Router, RouterLink } from '@angular/router';
import { PropertiesStore } from '../../../core/store/properties.store';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { ToastStore } from '../../../core/store/toast.store';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatsCard,
    ApplicationList,
    PropertySidebar,
    Nav,
    RouterLink,
    ConfirmModal,
  ],
  templateUrl: './owner-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OwnerDashboard implements OnInit {
  protected readonly store = inject(OwnerStore);
  protected readonly propertyStore = inject(PropertiesStore);
  protected readonly router = inject(Router);
  protected readonly toast = inject(ToastStore);


  // Signals derived from the service state
  protected readonly dashboardData = this.store.dashboard;
  protected readonly isLoading = this.store.loading;


  // Access the modal via ViewChild
  private deleteModal = viewChild.required<ConfirmModal>('deleteModal');

  // State to hold the ID of the property being targeted
  private propertyIdToDelete = signal<string | null>(null);

  handleDeleteRequest(id: string) {
    this.propertyIdToDelete.set(id);
    this.deleteModal().open(); // Open your reusable glassmorphism modal
  }

  executeDelete() {
    const id = this.propertyIdToDelete();
    if (!id) return;

    // Call your store or service to delete
    this.propertyStore.deleteProperty(id).subscribe({
      next: () => {
        this.propertyIdToDelete.set(null);
        this.toast.show('Property has been deleted sucessfully', 'success')
      },
      error: (err) => {
        console.error('Delete failed:', err);
      }
    });
  }

  handleEditRequest(prop: any) {
    this.router.navigate(['/owner/properties/edit', prop.id]);
  }

  ngOnInit(): void {
    this.store.initDashboard();
  }

  protected async handleAction(event: { id: string; status: 'approved' | 'rejected' }): Promise<void> {
    try {
      // 1. Trigger the Store action. 
      // This handles the PATCH and subsequent initDashboard() re-sync internally.
      await this.store.handleApplicationDecision(event.id, event.status);

      // 2. Success Feedback (Optional: Inject a ToastService here)
      console.log(`Application ${event.status} successfully.`);
      this.toast.show(`Application ${event.status} successfully.`, 'success')

    } catch (error) {
      // 3. Error Handling
      // The store sets a global error signal, but we can handle local 
      // UI feedback (like shaking the button or showing a toast) here.
      console.error('Action failed', error);
    }
  }




}
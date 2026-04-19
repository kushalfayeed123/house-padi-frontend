import { Component, OnInit, inject, signal, computed, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Nav } from '../../../../shared/components/nav/nav';
import { RentingStore } from '../../../../core/store/renting.store';
import { FormsModule } from '@angular/forms';
import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';
import { Lease } from '../../../../data/models/renting.model';

@Component({
  selector: 'app-my-rentals',
  standalone: true,
  imports: [CommonModule, RouterLink, Nav, ConfirmModal, FormsModule],
  templateUrl: './renter-dashboard.html',
})
export class RenterDashboard implements OnInit {
  rentingStore = inject(RentingStore);

  // Modal & Termination State
  private terminateModal = viewChild.required<ConfirmModal>('terminateModal');
  selectedLeaseId = signal<string | null>(null);
  terminationReason = signal('');

  activeLeases = computed(() => this.rentingStore.leases().filter(e => e.property !== null));

  pendingApps = computed(() =>
    this.rentingStore.applications().filter(app => !app.lease_id)
  );

  ngOnInit() {
    this.rentingStore.fetchMyLeases();
    this.rentingStore.fetchMyApplications();
  }

  getExpiryDate(lease: Lease) {
    const start = new Date(lease.startDate);
    const months = lease.property == null ? 0 : lease.property.leaseDurationMonths || 12;
    return new Date(start.setMonth(start.getMonth() + months));
  }

  triggerTermination(leaseId: string) {
    this.selectedLeaseId.set(leaseId);
    this.terminationReason.set('');
    this.terminateModal().open();
  }

  executeTermination() {
    if (!this.terminationReason()) return;

    // Call your service here
    console.log(`Terminating ${this.selectedLeaseId()} for reason: ${this.terminationReason()}`);
    // this.rentingStore.terminateLease(this.selectedLeaseId()!, this.terminationReason());
  }

 getLeaseCountdown(expiryDate: Date | string): string {
  const end = new Date(expiryDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Expired';
  
  // 1. Days logic (7 days and below)
  if (diffDays <= 7) {
    return `${diffDays} Day${diffDays > 1 ? 's' : ''} Left`;
  }

  // 2. Weeks logic (Less than 4 weeks)
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffDays < 28) {
    return `${diffWeeks} Week${diffWeeks > 1 ? 's' : ''} Left`;
  }

  // 3. Months logic (Default)
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths >= 1) {
    return `${diffMonths} Month${diffMonths > 1 ? 's' : ''} Left`;
  }

  // Fallback for that small gap between 28 days and a full month
  return `${diffWeeks} Weeks Left`;
}

// Calculate progress percentage for the bar
getLeaseProgress(startDate: string, expiryDate: Date): number {
  const start = new Date(startDate).getTime();
  const end = expiryDate.getTime();
  const now = new Date().getTime();

  if (now >= end) return 100;
  
  const total = end - start;
  const elapsed = now - start;
  return Math.min(Math.round((elapsed / total) * 100), 100);
}
}
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Nav } from '../../../../shared/components/nav/nav';
import { RentingStore } from '../../../../core/store/renting.store';

@Component({
  selector: 'app-my-rentals',
  standalone: true,
  imports: [CommonModule, RouterLink, Nav],
  templateUrl: './renter-dashboard.html',
})
export class RenterDashboard implements OnInit {
  // Inject the store
  rentingStore = inject(RentingStore);

  // Computed signals for categorized views
  activeLeases = computed(() =>
    this.rentingStore.applications().filter(app => app.lease_id)
  );

  pendingApps = computed(() =>
    this.rentingStore.applications().filter(app => !app.lease_id)
  );

  ngOnInit() {
    // Trigger the fetch on load
    this.rentingStore.fetchMyApplications();
  }
}
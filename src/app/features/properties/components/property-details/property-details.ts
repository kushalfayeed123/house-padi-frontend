import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../../../core/store/auth.store';
import { PropertiesStore } from '../../../../core/store/properties.store';
import { RentingStore } from '../../../../core/store/renting.store';
import { ToastStore } from '../../../../core/store/toast.store';
import { Nav } from '../../../../shared/components/nav/nav';
import { SafeUrlPipe } from '../../../../shared/pipes/safe-url-pipe';


@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, Nav, FormsModule, SafeUrlPipe],
  templateUrl: './property-details.html',
  styleUrl: './property-details.css',
})
export class PropertyDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  toast = inject(ToastStore);
  propertiesStore = inject(PropertiesStore);
  renting = inject(RentingStore);
  auth = inject(AuthStore);

  selectedTourDate = signal<string>('');
  minDate: string = '';
  activeImageIndex = signal(0);

  // flowState manages the interactive UI states
  flowState = signal<'idle' | 'applying' | 'waiting_approval' | 'viewing_lease' | 'paying' | 'success' | 'unavailable'>('idle');
  public authStore = inject(AuthStore);

  // 1. Get the current logged-in user ID
  private userId = computed(() => this.authStore.user()?.id);

  // 2. Find the specific application belonging to the user
  public currentUserApplication = computed(() => {
    const prop = this.propertiesStore.selectedProperty();
    if (!prop || !prop.applications) return null;
    return prop.applications.find(app => app.renter_id === this.userId());
  });

  // 3. Specifically check if THIS user is approved
  public isUserApproved = computed(() => {
    return this.currentUserApplication()?.status === 'approved';
  });

  // 4. Check if the property is "stolen" (someone else is approved)
  public isLockedByOthers = computed(() => {
    const prop = this.propertiesStore.selectedProperty();
    if (!prop || !prop.applications) return false;
    return prop.applications.some(app =>
      app.renter_id !== this.userId() && app.status === 'approved'
    );
  });

  // 5. Secure URL for the iframe
  public leaseUrl = computed(() => {
    return this.currentUserApplication()?.contract_url || '';
  });
  public leaseId = computed(() => {
    return this.currentUserApplication()?.lease_id || '';
  });

  public isRented = computed(() => {
    const prop = this.propertiesStore.selectedProperty();
    // Based on your MyApplication interface: status: 'rented'
    return prop?.status === 'rented';
  });


  ngOnInit() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // Fetch property data
        this.propertiesStore.fetchPropertyById(id);

        // We use a small timeout or effect to ensure the store is populated before calculating state
        setTimeout(() => this.calculateInitialFlowState(), 500);
        this.checkAndAutoApply();
      }
    });
  }

  private calculateInitialFlowState() {
    const prop = this.propertiesStore.selectedProperty();
    const user = this.auth.user();

    if (!prop) {
      this.flowState.set('idle');
      return;
    }

    const applications = prop.applications || [];
    // Check if any application is approved
    const approvedApp = applications.find(a => a.status === 'approved');

    if (approvedApp) {
      // If there is an approved app, only that specific user can see the lease
      if (user && approvedApp.renter_id === user.id) {
        this.flowState.set('viewing_lease');
      } else {
        // For everyone else (or guests), the property is locked/read-only
        this.flowState.set('unavailable');
      }
      return;
    }

    // If no one is approved, check if current user has a pending application
    if (user) {
      const myApp = applications.find(a => a.renter_id === user.id);
      if (myApp && myApp.status === 'submitted') {
        this.flowState.set('waiting_approval');
        return;
      }
    }

    this.flowState.set('idle');
  }

  private checkAndAutoApply() {
    const pendingAction = sessionStorage.getItem('pending_tour_date');
    if (this.auth.isAuthenticated() && pendingAction) {
      this.selectedTourDate.set(pendingAction);
      sessionStorage.removeItem('pending_tour_date');
      this.handleAction();
    }
  }

  goBack() {
    this.location.back();
  }

  goToHome() {
    this.router.navigate(['/']).then(() => {
      this.toast.show('Find your next dream home!', 'info');
    });
  }

  ngOnDestroy() {
    if (this.auth.isAuthenticated()) {
      this.propertiesStore.clearSelected();
    }
  }

  async handleAction() {
    const prop = this.propertiesStore.selectedProperty();
    const tourDate = this.selectedTourDate();

    if (!prop) return;
    const currentDate = new Date();

    if (!this.auth.isAuthenticated()) {
      this.toast.show('Authentication required to book a tour. Please sign in.', 'info');
      sessionStorage.setItem('pending_tour_date', tourDate || currentDate.toDateString());
      setTimeout(() => {
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: this.router.url }
        });
      }, 1000);
      return;
    }

    try {
      this.flowState.set('applying');
      await this.renting.applyForProperty(prop.id, tourDate);
      this.flowState.set('waiting_approval');
      this.toast.show('Application sent to owner!', 'success');
    } catch (err) {
      this.toast.show('Failed to send application', 'error');
      this.flowState.set('idle');
    }
  }

  async onConfirmAndPay() {
    const user = this.auth.user();
    const leaseId = this.leaseId()
    if (!leaseId || !user) return;

    this.flowState.set('paying');

    setTimeout(async () => {
      try {
        await this.renting.finalizePayment({
          leaseId: leaseId,
          reference: 'HP_REF_' + Math.random().toString(36).substring(7),
          userId: user.id
        });
        this.flowState.set('success');
      } catch (err) {
        this.flowState.set('viewing_lease');
      }
    }, 2000);
  }

  async onDeclineLease() {
    // Placeholder for future rejection endpoint
    const confirm = window.confirm("Are you sure you want to reject this lease? This will cancel your application.");
    if (confirm) {
      this.toast.show('Rejection endpoint not implemented yet. Reverting UI for now.', 'info');
      this.flowState.set('idle');
    }
  }
}
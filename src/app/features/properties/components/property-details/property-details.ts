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

  public applicationCount = computed(() => {
    const prop = this.propertiesStore.selectedProperty();
    return prop?.applications?.length || 0;
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

    if (!prop) return;

    const applications = prop.applications || [];
    const myApp = applications.find(a => a.renter_id === user?.id);

    // If approved, show lease
    if (myApp?.status === 'approved') {
      this.flowState.set('viewing_lease');
      return;
    }

    // If already rented
    if (prop.status === 'rented') {
      this.flowState.set('unavailable');
      return;
    }

    // ONLY show the 'waiting_approval' modal if we aren't already in a session 
    // where the user chose to "Stay on page"
    if (myApp?.status === 'submitted' && this.flowState() !== 'idle') {
      this.flowState.set('waiting_approval');
    } else {
      this.flowState.set('idle');
    }
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
    let tourDate = this.selectedTourDate();

    if (!prop) return;

    // Fallback to current date
    if (!tourDate) {
      tourDate = new Date().toISOString().split('T')[0];
    }

    // PREVENT REDUNDANT SUBMISSION: Check if user already has an application
    // This handles the "Login Route" scenario where they might try to apply again
    if (this.auth.isAuthenticated() && this.currentUserApplication()) {
      this.toast.show('You have already applied for this property.', 'info');
      this.calculateInitialFlowState(); // Force UI to 'waiting_approval' or 'viewing_lease'
      return;
    }

    if (!this.auth.isAuthenticated()) {
      this.toast.show('Authentication required to book a tour.', 'info');
      sessionStorage.setItem('pending_tour_date', tourDate);
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

  async refreshAndStay() {
    const prop = this.propertiesStore.selectedProperty();
    if (!prop) return;

    // 1. Show a quick loading indicator
    this.flowState.set('applying');

    try {
      // 2. Fetch fresh data from the server
      await this.propertiesStore.fetchPropertyById(prop.id);

      // 3. Force the state to 'idle'
      // This closes the modal even if the application is still 'submitted'
      this.flowState.set('idle');

      this.toast.show('Dashboard updated', 'success');
    } catch (err) {
      this.flowState.set('idle');
      this.toast.show('Could not refresh data', 'error');
    }
  }
}
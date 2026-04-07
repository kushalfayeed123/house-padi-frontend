import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DecimalPipe, Location, CurrencyPipe } from '@angular/common';
import { AuthStore } from '../../../core/store/auth.store';
import { RentingStore } from '../../../core/store/renting.store';
import { PropertiesStore } from '../../../core/store/properties.store';
import { Nav } from '../../../shared/components/nav/nav';
import { FormsModule } from '@angular/forms';
import { ToastStore } from '../../../core/store/toast.store';

@Component({
  selector: 'app-property-details',
  standalone: true, // Assuming standalone based on imports
  imports: [CommonModule, CurrencyPipe, Nav, FormsModule],
  templateUrl: './property-details.html',
  styleUrl: './property-details.css',
})
export class PropertyDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router); // Added missing injection
  private location = inject(Location);
  toast = inject(ToastStore); // Add this line ✅
  

  propertiesStore = inject(PropertiesStore);
  renting = inject(RentingStore);
  auth = inject(AuthStore);

  selectedTourDate = signal<string>('');
  minDate: string = '';

  activeImageIndex = signal(0);
  flowState = signal<'idle' | 'applying' | 'waiting_approval' | 'viewing_lease' | 'paying' | 'success'>('idle');

  ngOnInit() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.propertiesStore.fetchPropertyById(id);
      }
    });
  }

  goBack() {
    this.location.back();
  }

  ngOnDestroy() {
    this.propertiesStore.clearSelected();
  }

  async handleAction() {
    const prop = this.propertiesStore.selectedProperty();
    const tourDate = this.selectedTourDate();

    if (!prop || !tourDate) return;

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    try {
      this.flowState.set('applying');
      // Pass the selected tour date to the store
      const app = await this.renting.applyForProperty(prop.id, tourDate);

      if (app.status === 'approved') {
        this.toast.show('Interest logged! We will notify the owner.', 'success');
        await this.renting.initiateLease(app.id, this.auth.user()!.id);
        this.flowState.set('viewing_lease');
      } else {
        this.flowState.set('waiting_approval');
      }
    } catch (err) {
      this.flowState.set('idle');
    }
  }

  async onConfirmAndPay() {
    const lease = this.renting.currentLease();
    const user = this.auth.user();
    if (!lease || !user) return;

    this.flowState.set('paying');

    // Simulate Payment Gateway (e.g. Paystack)
    setTimeout(async () => {
      try {
        await this.renting.finalizePayment({
          leaseId: lease.id,
          reference: 'HP_REF_' + Math.random().toString(36).substring(7),
          userId: user.id
        });
        this.flowState.set('success');
      } catch (err) {
        this.flowState.set('viewing_lease');
      }
    }, 2000);
  }
}
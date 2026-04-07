import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DecimalPipe, Location, CurrencyPipe } from '@angular/common';
import { AuthStore } from '../../../core/store/auth.store';
import { RentingStore } from '../../../core/store/renting.store';
import { PropertiesStore } from '../../../core/store/properties.store';
import { Nav } from '../../../shared/components/nav/nav';

@Component({
  selector: 'app-property-details',
  standalone: true, // Assuming standalone based on imports
  imports: [CommonModule, DecimalPipe, CurrencyPipe, Nav],
  templateUrl: './property-details.html',
  styleUrl: './property-details.css',
})
export class PropertyDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router); // Added missing injection
  private location = inject(Location);

  propertiesStore = inject(PropertiesStore);
  renting = inject(RentingStore);
  auth = inject(AuthStore);

  activeImageIndex = signal(0);
  flowState = signal<'idle' | 'applying' | 'waiting_approval' | 'viewing_lease' | 'paying' | 'success'>('idle');

  ngOnInit() {
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
    if (!prop) return;

    // Fixed: used this.auth.isAuthenticated() to match your inject
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }

    try {
      this.flowState.set('applying');
      // Fixed: used this.renting to match your inject
      const app = await this.renting.applyForProperty(prop.id);

      if (app.status === 'approved') {
        await this.renting.initiateLease(app.id, this.auth.user()!.id);
        this.flowState.set('viewing_lease');
      } else {
        this.flowState.set('waiting_approval');
      }
    } catch (err) {
      console.error('Application error:', err);
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
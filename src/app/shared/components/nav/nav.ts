import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthStore } from '../../../core/store/auth.store'; // Adjust path
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  theme = inject(ThemeService);
   protected readonly auth = inject(AuthStore);

  // Derived signal for the dashboard route
  protected readonly dashboardLink = computed(() => {
    const user = this.auth.user();
    if (!user) return '/auth/login';

    // Explicit role check matching your backend RolesGuard logic
    return user.role === 'owner' ? '/owner' : '/renter';
  });

  displayName = computed(() => {
    const user = this.auth.user();
    return user ? user.firstName : '';
  });

  onLogout() {
    this.auth.logout();
  }
}
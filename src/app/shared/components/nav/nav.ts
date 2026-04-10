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
  auth = inject(AuthStore);

  displayName = computed(() => {
    const user = this.auth.user();
    return user ? user.firstName : '';
  });

  onLogout() {
    this.auth.logout();
  }
}
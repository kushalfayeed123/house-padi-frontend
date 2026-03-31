import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthStore } from '../../core/store/auth.store';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertiesStore } from '../../core/store/properties.store';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',

})
export class Home {
  theme = inject(ThemeService);
  auth = inject(AuthStore);
  propStore = inject(PropertiesStore);
  router = inject(Router);

  categories = ['Trending', 'Modern Apartments', 'Self-Contain', 'Shortlets', 'Office Space', 'Luxury Duplex'];

  filters = {
    location: '',
    type: 'apartment'
  };

  ngOnInit() {
    this.propStore.fetch(true, 12);
  }

  onSearch() {
    this.propStore.search(this.filters.location);
  }
}

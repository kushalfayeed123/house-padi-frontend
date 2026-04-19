import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthStore } from '../../core/store/auth.store';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertiesStore } from '../../core/store/properties.store';
import { Nav } from '../../shared/components/nav/nav';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, Nav, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  theme = inject(ThemeService);
  auth = inject(AuthStore);
  propStore = inject(PropertiesStore);
  router = inject(Router);

  chatPrompt = '';

  categories = [
    { name: 'Trending', icon: 'bolt' },
    { name: 'Apartments', icon: 'apartment' },
    { name: 'Self-Contain', icon: 'grid_view' },
    { name: 'Shortlets', icon: 'bedtime' },
    { name: 'Office Space', icon: 'work' },
    { name: 'Luxury', icon: 'auto_awesome' }
  ];

  trendingSearches = ['2 Bedroom in Jos', 'Self-contain in Lagos', 'Serviced Apartment', 'Offices in Abuja'];

  ngOnInit() {
    this.propStore.fetchFeatured(12);
    this.propStore.fetchMarketNews(); // Add this line
  }

  onSearch() {
    if (!this.chatPrompt.trim()) return;
    this.propStore.search(this.chatPrompt);
    // Scroll to results if needed
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  setPrompt(prompt: string) {
    this.chatPrompt = prompt;
    this.onSearch();
  }
}
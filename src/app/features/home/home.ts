// src/app/pages/home/home.ts
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

  categories = ['Trending', 'Modern Apartments', 'Self-Contain', 'Shortlets', 'Office Space', 'Luxury Duplex'];

  // Single property for the AI input
  chatPrompt = '';

  ngOnInit() {
    // Initial fetch for featured properties
    this.propStore.fetchFeatured(12);
  }

  onSearch() {
    // Component simply triggers the store's search action
    this.propStore.search(this.chatPrompt);
  }
}
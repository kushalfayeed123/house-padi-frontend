import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
export type StatsVariant = 'primary' | 'success' | 'warning' | 'info' | 'danger';

@Component({
  selector: 'app-stats-card',
  imports: [CommonModule],
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.css',
})
export class StatsCard {
  title = input.required<string>();
  value = input.required<string | number | null>();
  icon = input.required<string>();
  trend = input<string>();
  variant = input<StatsVariant>('primary');

  protected iconClasses = computed(() => {
    const base = 'p-3 rounded-xl flex items-center justify-center ';
    const variants: Record<StatsVariant, string> = {
      primary: 'bg-indigo-50 text-indigo-600',
      success: 'bg-emerald-50 text-emerald-600',
      warning: 'bg-amber-50 text-amber-600',
      info: 'bg-blue-50 text-blue-600',
      danger: 'bg-rose-50 text-rose-600'
    };
    return base + variants[this.variant()];
  });
}

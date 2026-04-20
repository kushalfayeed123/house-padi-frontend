import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PropertiesStore } from '../../../core/store/properties.store';
import { ToastStore } from '../../../core/store/toast.store';
import { Property } from '../../../data/models/property.model';

@Component({
  selector: 'app-property-sidebar',
  imports: [CommonModule, RouterLink,],
  templateUrl: './property-sidebar.html',
  styleUrl: './property-sidebar.css',
})
export class PropertySidebar {
  // Services
  private router = inject(Router);

  private propertyService = inject(PropertiesStore);

  // Inputs & Outputs
  properties = input.required<any[]>();
  // Since input is read-only, we emit the ID to the parent to handle deletion
  deleted = output<string>();

  protected getStatusClasses(status: string): string {
    const base = 'text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ';
    const themes: Record<string, string> = {
      'available': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
      'pending': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
      'rented': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
      'draft': 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'
    };
    return base + (themes[status.toLowerCase()] || 'bg-gray-100 text-gray-600');
  }

  onEditAction = output<Property>(); // Output for editing
  onDeleteAction = output<string>(); // Output for deleting (sends ID)

  onEdit(prop: Property) {
    this.onEditAction.emit(prop);
  }

  onDelete(id: string) {
    this.onDeleteAction.emit(id);
  }

}
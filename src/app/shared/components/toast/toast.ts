// src/app/shared/components/toast/toast.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastStore } from '../../../core/store/toast.store';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html'
})
export class ToastComponent {
  store = inject(ToastStore);
}
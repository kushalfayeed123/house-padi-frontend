import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" (click)="close()"></div>

        <div class="glass-card relative w-full max-w-md p-8 rounded-[2.5rem] border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl scale-in">
          <div class="flex flex-col items-center text-center space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-2">
              <span class="material-symbols-outlined text-rose-500 text-3xl">warning</span>
            </div>
            
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {{ title() }}
            </h2>
            
            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {{ message() }}
            </p>

            <div class="flex gap-3 w-full pt-4">
              <button (click)="close()" 
                class="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button (click)="confirm()" 
                class="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 active:scale-95 transition-all">
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .scale-in { animation: scaleIn 0.2s ease-out; }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class ConfirmModal {
  isOpen = signal(false);
  title = input('Are you sure?');
  message = input('This action cannot be undone.');
  
  onConfirm = output<void>();
  onCancel = output<void>();

  open() { this.isOpen.set(true); }
  close() { 
    this.isOpen.set(false); 
    this.onCancel.emit();
  }
  confirm() {
    this.onConfirm.emit();
    this.isOpen.set(false);
  }
}
// src/app/core/store/toast.store.ts
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastStore {
  private _message = signal<string | null>(null);
  private _type = signal<ToastType>('info');
  private _show = signal(false);

  readonly message = this._message.asReadonly();
  readonly type = this._type.asReadonly();
  readonly isVisible = this._show.asReadonly();

  show(message: string, type: ToastType = 'info') {
    this._message.set(message);
    this._type.set(type);
    this._show.set(true);

    // Auto-hide after 4 seconds
    setTimeout(() => this.hide(), 4000);
  }

  hide() {
    this._show.set(false);
  }
}
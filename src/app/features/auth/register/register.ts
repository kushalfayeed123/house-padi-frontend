import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../core/store/auth.store';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  public authStore = inject(AuthStore);

  role = signal<'renter' | 'owner'>('renter');

  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['renter']
  });

  setRole(val: 'renter' | 'owner') {
    this.role.set(val);
    this.registerForm.patchValue({ role: val });
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      try {
        await this.authStore.register(this.registerForm.value);
      } catch (e) { /* Error handled by store signal */ }
    }
  }
}

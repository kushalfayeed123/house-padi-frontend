import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../core/store/auth.store';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public authStore = inject(AuthStore);

  role = signal<'renter' | 'owner'>('renter');
  returnUrl: string | null = null; // Store the URL locally

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
  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      try {
        await this.authStore.register(this.registerForm.value);
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: this.returnUrl, registered: 'true' }
        });
      } catch (e) { /* Error handled by store signal */ }
    }
  }
}

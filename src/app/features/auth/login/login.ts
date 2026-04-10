import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthStore } from '../../../core/store/auth.store';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  public authStore = inject(AuthStore);

  isRecentlyRegistered = this.route.snapshot.queryParams['registered'] === 'true';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  async onSubmit() {
    if (this.loginForm.valid) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      await this.authStore.login(this.loginForm.value, returnUrl);
    }
  }
}

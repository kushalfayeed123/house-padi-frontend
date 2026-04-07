import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/store/auth.store';
import { ToastComponent } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected title = 'house-padi';



}

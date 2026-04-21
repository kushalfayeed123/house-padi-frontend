import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast';
import { injectSpeedInsights } from '@vercel/speed-insights';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent,],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  ngOnInit(): void {
    injectSpeedInsights();
  }


  protected title = 'house-padi';


}

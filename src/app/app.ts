import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from "@vercel/analytics"



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent,],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  ngOnInit(): void {
    injectSpeedInsights();
    inject()
  }


  protected title = 'house-padi';


}

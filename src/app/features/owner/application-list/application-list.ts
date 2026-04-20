import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-application-list',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
   templateUrl: './application-list.html',
  styleUrl: './application-list.css',
})
export class ApplicationList {
  applications = input.required<any[]>();
  onAction = output<{ id: string; status: 'approved' | 'rejected' }>();
}

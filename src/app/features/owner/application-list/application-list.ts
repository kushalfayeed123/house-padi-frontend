import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-application-list',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
   templateUrl: './application-list.html',
  styleUrl: './application-list.css',
})
export class ApplicationList {
  applications = input.required<any[]>();
  onAction = output<{ id: string; status: 'approved' | 'rejected' }>();
}

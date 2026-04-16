import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class Analytics {
  bookingsChartData = [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 52 },
    { month: 'Mar', count: 38 },
    { month: 'Apr', count: 65 },
    { month: 'May', count: 48 },
    { month: 'Jun', count: 30 },
    { month: 'Jul', count: 18 },
    { month: 'Aug', count: 75 },
    { month: 'Sep', count: 85 },
    { month: 'Oct', count: 55 },
    { month: 'Nov', count: 40 },
    { month: 'Dec', count: 25 },
  ];
}

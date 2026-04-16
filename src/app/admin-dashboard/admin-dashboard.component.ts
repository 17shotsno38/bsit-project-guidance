import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  counselor = {
    name: 'Dr. Sioney R. Lina',
    title: 'Guidance Counselor',
    avatar: 'https://i.pravatar.cc/80?img=47',
    id: 'GC-47890'
  };

  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
    }
    this.router.navigate(['/login']);
  }
}

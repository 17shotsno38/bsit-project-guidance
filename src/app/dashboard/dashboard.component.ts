import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  profileData: any = null;
  
  constructor(private apiService: ApiService, private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.apiService.getDashboardData().subscribe({
      next: (res) => {
        if (res.success) {
          this.profileData = res.data.profile;
        }
      },
      error: (err) => console.error('Failed to load dashboard profile', err)
    });
  }
}
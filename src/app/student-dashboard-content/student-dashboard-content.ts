import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-student-dashboard-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard-content.html',
  styleUrl: './student-dashboard-content.css'
})
export class StudentDashboardContent implements OnInit {
  queueData: any = null;
  upcomingAppointments: any[] = [];
  profileData: any = null;
  
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.apiService.getDashboardData().subscribe({
      next: (res) => {
        if (res.success) {
          this.queueData = res.data.queue;
          this.upcomingAppointments = res.data.upcomingAppointments;
          this.profileData = res.data.profile;
        }
      },
      error: (err) => console.error('Failed to load dashboard data', err)
    });
  }

  joinWalkInQueue(event: Event): void {
    event.preventDefault();
    this.apiService.joinQueue().subscribe({
      next: (res) => {
        if (res.success) {
          this.queueData = res.queue;
        }
      },
      error: (err) => console.error('Failed to join queue', err)
    });
  }
}

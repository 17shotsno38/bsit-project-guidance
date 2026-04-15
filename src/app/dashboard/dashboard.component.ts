import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from '../profile/profile.component';
import { AppointmentsComponent } from '../appointments/appointments.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProfileComponent, AppointmentsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  activeNav = 'dashboard';
  queueData: any = null;
  upcomingAppointments: any[] = [];
  profileData: any = null;
  
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

  setActive(nav: string): void {
    this.activeNav = nav;
  }
}
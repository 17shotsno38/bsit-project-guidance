import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-admin-dashboard-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard-content.html',
  styleUrl: './admin-dashboard-content.css'
})
export class AdminDashboardContent implements OnInit {
  availabilityStatus: 'online' | 'on-break' | 'offline' = 'online';

  availabilityOptions = [
    { value: 'online',   label: 'Online',    color: '#16a34a' },
    { value: 'on-break', label: 'On Break',  color: '#d97706' },
    { value: 'offline',  label: 'Offline',   color: '#6b7280' }
  ];

  showAvailabilityDropdown = false;

  queueData = {
    estimatedWait: '0 mins',
    studentsAhead: 0,
    isActive: false
  };

  upcomingSessions: any[] = [];

  todayStats = {
    totalSessions: 0,
    completed: 0,
    pending: 0,
    walkinQueue: 0
  };

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit(): void {
    this.refreshDashboardData();
  }

  refreshDashboardData(): void {
    this.apiService.getAdminDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.todayStats = res.stats;
          this.queueData = {
            estimatedWait: res.queue.estimatedWait || '0 mins',
            studentsAhead: res.queue.peopleAhead,
            isActive: res.queue.peopleAhead > 0
          };
          this.upcomingSessions = res.upcomingAppointments.map((app: any) => ({
            id: app.id,
            studentName: 'Student User', 
            tag: app.tag,
            detail: app.detail,
            avatar: app.avatar
          }));
        }
      },
      error: (err) => console.error("Error fetching dashboard mock data", err)
    });
  }

  get currentAvailability() {
    return this.availabilityOptions.find(o => o.value === this.availabilityStatus)!;
  }

  selectAvailability(value: string): void {
    this.availabilityStatus = value as 'online' | 'on-break' | 'offline';
    this.showAvailabilityDropdown = false;
  }

  toggleAvailabilityDropdown(): void {
    this.showAvailabilityDropdown = !this.showAvailabilityDropdown;
  }

  callNextStudent(): void {
    if (this.queueData.studentsAhead > 0) {
      this.apiService.callStudent().subscribe({
        next: (res) => {
          this.refreshDashboardData();
          alert('Next walk-in student notified via Gmail!');
        },
        error: (err) => console.error("Error calling student", err)
      });
    }
  }

  reschedule(session: any): void {
    alert(`Reschedule requested for ${session.studentName}`);
  }

  cancelSession(session: any): void {
    this.upcomingSessions = this.upcomingSessions.filter(s => s.id !== session.id);
  }
}

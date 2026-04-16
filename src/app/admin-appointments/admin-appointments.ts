import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-appointments.html',
  styleUrl: './admin-appointments.css'
})
export class AdminAppointments implements OnInit {
  upcomingSessions: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.refreshDashboardData();
  }

  refreshDashboardData(): void {
    this.apiService.getAdminDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.upcomingSessions = res.upcomingAppointments.map((app: any) => ({
            id: app.id,
            studentName: 'Student User',
            tag: app.tag,
            detail: app.detail,
            avatar: app.avatar
          }));
        }
      },
      error: (err) => console.error("Error fetching admin appointments mock data", err)
    });
  }

  callStudent(session: any): void {
    this.apiService.callStudent(session.id).subscribe({
      next: (res) => {
        this.refreshDashboardData();
        alert('Appointment session student notified via Gmail!');
      },
      error: (err) => console.error("Error calling student", err)
    });
  }

  reschedule(session: any): void {
    alert(`Reschedule requested for ${session.studentName}`);
  }

  cancelSession(session: any): void {
    this.upcomingSessions = this.upcomingSessions.filter(s => s.id !== session.id);
  }
}

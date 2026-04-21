import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { firstValueFrom } from 'rxjs';

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
    { value: 'online',   label: 'Online',   color: '#16a34a' },
    { value: 'on-break', label: 'On Break', color: '#d97706' },
    { value: 'offline',  label: 'Offline',  color: '#6b7280' }
  ];

  showAvailabilityDropdown = false;

  queueData = {
    estimatedWait: '0 mins',
    studentsAhead: 0,
    isActive: false,
    tickets: [] as any[]
  };

  upcomingSessions: any[] = [];

  todayStats = {
    totalSessions: 0,
    completed: 0,
    pending: 0,
    walkinQueue: 0
  };

  isLoading = true;
  isCallingStudent = false;
  errorMessage = '';

  profileData: any = null;

  constructor(private router: Router, private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    this.apiService.profile$.subscribe(profile => {
      if (profile) {
        this.profileData = profile;
        this.cdr.detectChanges();
      }
    });

    await this.refreshDashboardData();
  }

  async refreshDashboardData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const res = await firstValueFrom(this.apiService.getAdminDashboard());
      if (res.success) {
        this.todayStats = res.stats;
        this.queueData = {
          estimatedWait: res.queue?.estimatedWait || '0 mins',
          studentsAhead: res.queue?.peopleAhead ?? 0,
          isActive:      (res.queue?.peopleAhead ?? 0) > 0,
          tickets:       (res.queue?.studentEmails || []).map((email: string, idx: number) => ({
            number: idx + 1,
            name: email.split('@')[0],
            email: email
          }))
        };
        this.upcomingSessions = (res.upcomingAppointments ?? []).map((app: any) => ({
          id:          app.id,
          studentName: 'Student User',
          tag:         app.tag,
          detail:      app.detail,
          avatar:      app.avatar
        }));
      } else {
        this.errorMessage = res.message || 'Failed to load dashboard data.';
      }
    } catch (err: any) {
      this.errorMessage = 'Could not reach the server. Make sure the backend is running.';
      console.error('Error fetching admin dashboard:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
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

  async callNextStudent(): Promise<void> {
    if (this.queueData.studentsAhead <= 0 || this.isCallingStudent) return;
    this.isCallingStudent = true;
    try {
      await firstValueFrom(this.apiService.callStudent());
      await this.refreshDashboardData();
      alert('Next walk-in student notified!');
    } catch (err: any) {
      alert('Failed to call next student. Please try again.');
      console.error('Error calling student:', err);
    } finally {
      this.isCallingStudent = false;
      this.cdr.detectChanges();
    }
  }

  reschedule(session: any): void {
    this.router.navigate(['/appointments'], { queryParams: { rescheduleId: session.id } });
  }

  async cancelSession(session: any): Promise<void> {
    if (!confirm(`Cancel the session for ${session.studentName}?`)) return;
    try {
      await firstValueFrom(this.apiService.deleteAppointment(session.id));
      this.upcomingSessions = this.upcomingSessions.filter(s => s.id !== session.id);
    } catch (err: any) {
      alert('Failed to cancel session. Please try again.');
      console.error('Error cancelling session:', err);
    } finally {
      this.cdr.detectChanges();
    }
  }
}

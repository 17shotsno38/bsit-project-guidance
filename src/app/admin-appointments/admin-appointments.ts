import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-appointments.html',
  styleUrl: './admin-appointments.css'
})
export class AdminAppointments implements OnInit {
  allSessions:   any[] = [];
  isLoading      = true;
  isUpdatingId:  string | null = null;
  errorMessage   = '';
  filterStatus   = 'all';

  readonly statusFilters = [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending' },
    { key: 'serving',   label: 'Serving' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  get filteredSessions(): any[] {
    if (this.filterStatus === 'all') return this.allSessions;
    return this.allSessions.filter(s => s.status === this.filterStatus);
  }

  countByStatus(status: string): number {
    return this.allSessions.filter(s => s.status === status).length;
  }

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.refreshDashboardData();
  }

  setFilter(status: string): void {
    this.filterStatus = status;
  }

  async refreshDashboardData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const res = await firstValueFrom(this.apiService.getAdminDashboard());
      if (res.success) {
        this.allSessions = (res.upcomingAppointments ?? []).map((app: any) => ({
          id:            app.id,
          status:        app.status || 'pending',
          queueNumber:   app.queueNumber,
          studentName:   app.studentName  || 'Student',
          studentAvatar: app.studentAvatar || 'https://i.pravatar.cc/80?img=12',
          tag:           app.tag,
          detail:        app.detail,
          avatar:        app.avatar
        }));
      } else {
        this.errorMessage = res.message || 'Failed to load appointments.';
      }
    } catch (err: any) {
      this.errorMessage = 'Could not reach the server. Make sure the backend is running.';
      console.error('Error fetching admin appointments:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async setStatus(session: any, status: string): Promise<void> {
    if (this.isUpdatingId) return;
    this.isUpdatingId = session.id;
    try {
      await firstValueFrom(this.apiService.updateAppointmentStatus(session.id, status));
      // Optimistically update local state
      session.status = status;
      this.cdr.detectChanges();
    } catch (err: any) {
      alert('Failed to update status. Please try again.');
      console.error('Error updating appointment status:', err);
    } finally {
      this.isUpdatingId = null;
      this.cdr.detectChanges();
    }
  }

  // Legacy: used by admin "Call" button — marks as serving via status endpoint
  async callStudent(session: any): Promise<void> {
    await this.setStatus(session, 'serving');
  }

  reschedule(session: any): void {
    alert(`Reschedule requested for ${session.studentName}`);
  }
}

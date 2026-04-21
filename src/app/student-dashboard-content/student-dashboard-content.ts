import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-student-dashboard-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard-content.html',
  styleUrl: './student-dashboard-content.css'
})
export class StudentDashboardContent implements OnInit, OnDestroy {
  queueData: any = null;
  upcomingAppointments: any[] = [];
  profileData: any = null;
  counselors: any[] = [];
  isLoading = true;
  isJoiningQueue = false;
  isCancellingId: string | null = null;
  errorMessage = '';
  myQueueEntry: any = null;
  showQueueTicket = false;
  isWithdrawingQueue = false;

  /** Controls the "It's your turn!" full-screen alert */
  showCalledAlert = false;
  calledAppointment: any = null;

  /** IDs of appointments already alerted so we don't spam */
  private alertedIds = new Set<string>();
  private pollInterval: any = null;

  constructor(private apiService: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    this.apiService.profile$.subscribe(profile => {
      if (profile) this.profileData = profile;
    });
    await this.loadDashboardData();
    // Poll every 10s for status changes
    this.pollInterval = setInterval(() => this.pollAppointmentStatus(), 10000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  /** Polls the dashboard data and shows alert if any appointment is now 'serving' */
  private async pollAppointmentStatus(): Promise<void> {
    try {
      const res = await firstValueFrom(this.apiService.getDashboardData());
      if (!res.success) return;

      const appointments: any[] = res.data.upcomingAppointments || [];
      this.upcomingAppointments = appointments;
      if (res.data.queue) this.queueData = res.data.queue;

      const serving = appointments.find(
        (a: any) => a.status === 'serving' && !this.alertedIds.has(a.id)
      );
      if (serving) {
        this.alertedIds.add(serving.id);
        this.calledAppointment = serving;
        this.showCalledAlert = true;
      }

      this.cdr.detectChanges();
    } catch { /* silently ignore poll errors */ }
  }

  dismissCalledAlert(): void {
    this.showCalledAlert = false;
    this.calledAppointment = null;
  }

  async loadDashboardData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const [res, counselorRes, entryRes] = await Promise.all([
        firstValueFrom(this.apiService.getDashboardData()),
        firstValueFrom(this.apiService.getCounselors()).catch(() => ({ success: false, counselors: [] })),
        firstValueFrom(this.apiService.getMyQueueEntry()).catch(() => ({ success: false, entry: null }))
      ]);

      if (res.success) {
        this.queueData            = res.data.queue;
        this.upcomingAppointments = res.data.upcomingAppointments;
        this.profileData          = res.data.profile;

        // Seed alertedIds with already-serving appointments so we only
        // alert on NEW state changes, not on page load.
        for (const a of this.upcomingAppointments) {
          if (a.status === 'serving') this.alertedIds.add(a.id);
        }
      } else {
        this.errorMessage = res.message || 'Failed to load dashboard.';
      }

      if (counselorRes.success) {
        this.counselors = counselorRes.counselors || [];
      }

      if (entryRes.success && entryRes.entry) {
        this.myQueueEntry = entryRes.entry;
      }
    } catch (err: any) {
      this.errorMessage = 'Could not reach the server. Make sure the backend is running.';
      console.error('Failed to load dashboard data:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async joinWalkInQueue(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isJoiningQueue) return;
    this.isJoiningQueue = true;
    try {
      const res = await firstValueFrom(this.apiService.joinQueue());
      if (res.success) {
        if (res.queue) this.queueData = res.queue;
        if (res.entry) {
          this.myQueueEntry = res.entry;
          this.showQueueTicket = true;
        } else if (res.alreadyJoined && res.entry) {
          this.myQueueEntry = res.entry;
          this.showQueueTicket = true;
        }
      }
    } catch (err: any) {
      alert('Failed to join the queue. Please try again.');
      console.error('Failed to join queue:', err);
    } finally {
      this.isJoiningQueue = false;
      this.cdr.detectChanges();
    }
  }

  dismissQueueTicket(): void {
    this.showQueueTicket = false;
  }

  async withdrawWalkInQueue(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isWithdrawingQueue) return;
    this.isWithdrawingQueue = true;
    try {
      const res = await firstValueFrom(this.apiService.withdrawQueue());
      if (res.success && res.queue) {
        this.queueData = res.queue;
      } else {
        await this.loadDashboardData();
      }
      this.myQueueEntry = null;
      this.showQueueTicket = false;
    } catch (err: any) {
      alert('Failed to withdraw from the queue. Please try again.');
      console.error('Failed to withdraw from queue:', err);
    } finally {
      this.isWithdrawingQueue = false;
      this.cdr.detectChanges();
    }
  }

  startReschedule(id: string): void {
    this.router.navigate(['/appointments'], { queryParams: { rescheduleId: id } });
  }

  async cancelAppointment(id: string): Promise<void> {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    if (this.isCancellingId) return;
    this.isCancellingId = id;
    try {
      const res = await firstValueFrom(this.apiService.updateAppointmentStatus(id, 'cancelled'));
      if (res.success) {
        this.upcomingAppointments = this.upcomingAppointments.filter(a => a.id !== id);
        this.cdr.detectChanges();
      } else {
        alert(res.message || 'Failed to cancel appointment.');
      }
    } catch (err: any) {
      alert('Could not cancel the appointment. Please try again.');
      console.error('Failed to cancel appointment:', err);
    } finally {
      this.isCancellingId = null;
      this.cdr.detectChanges();
    }
  }
}

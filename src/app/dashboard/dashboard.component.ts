import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ThemeService } from '../services/theme.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  host: { '[class.dark]': 'isDark' }
})
export class DashboardComponent implements OnInit, OnDestroy {
  profileData: any = null;
  isLoading = true;
  notifications: any[] = [];
  private notificationInterval: any;

  get isDark(): boolean { return this.themeService.isDark; }
  toggleTheme(): void { this.themeService.toggle(); }

  constructor(private apiService: ApiService, private router: Router, private cdr: ChangeDetectorRef, public themeService: ThemeService) {}

  async ngOnInit(): Promise<void> {
    this.apiService.profile$.subscribe(profile => {
      if (profile) {
        this.profileData = profile;
        this.isLoading = false;
      }
    });
    
    // Start polling for notifications
    this.startNotificationPolling();

    // Only fetch if not already loaded, or we just want to ensure freshness
    await this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    try {
      await firstValueFrom(this.apiService.getProfile());
    } catch (err: any) {
      console.error('Failed to load dashboard profile:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
  }

  startNotificationPolling(): void {
    if (typeof window !== 'undefined') {
      this.notificationInterval = setInterval(async () => {
        try {
          const res = await firstValueFrom(this.apiService.getNotifications());
          if (res.success && res.notifications && res.notifications.length > 0) {
            this.notifications = res.notifications;
            this.cdr.detectChanges();
          }
        } catch (err) {
          // suppress polling errors
        }
      }, 3000); // Check every 3 seconds for quick response
    }
  }

  async dismissNotifications(): Promise<void> {
    try {
      await firstValueFrom(this.apiService.clearNotifications());
      this.notifications = [];
      this.cdr.detectChanges();
      
      if (typeof window !== 'undefined') {
          window.location.reload();
      }
    } catch (err) {
      console.error('Failed to dismiss notifications', err);
    }
  }
}
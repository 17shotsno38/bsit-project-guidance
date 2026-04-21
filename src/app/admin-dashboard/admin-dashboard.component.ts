import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ThemeService } from '../services/theme.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
  host: { '[class.dark]': 'isDark' }
})
export class AdminDashboardComponent implements OnInit {
  profileData: any = null;

  get isDark(): boolean { return this.themeService.isDark; }
  toggleTheme(): void { this.themeService.toggle(); }

  constructor(private router: Router, private apiService: ApiService, private cdr: ChangeDetectorRef, public themeService: ThemeService) {}

  async ngOnInit(): Promise<void> {
    this.apiService.profile$.subscribe(profile => {
      if (profile) {
        this.profileData = profile;
        this.cdr.detectChanges();
      }
    });
    
    try {
      await firstValueFrom(this.apiService.getProfile());
    } catch (err: any) {
      console.error('Failed to load admin profile:', err);
    }
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authToken');
    }
    this.router.navigate(['/login']);
  }
}

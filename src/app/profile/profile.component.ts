import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  activeNav = 'profile';
  profile: any = {};
  originalProfile: any = null;
  hasChanges = false;
  isLoading = true;
  isSaving = false;
  errorMessage = '';

  constructor(private apiService: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const res = await firstValueFrom(this.apiService.getProfile());
      if (res.success) {
        this.profile = res.profile;
        this.originalProfile = JSON.parse(JSON.stringify(res.profile));
      } else {
        this.errorMessage = res.message || 'Failed to load profile data.';
      }
    } catch (err: any) {
      this.errorMessage = 'Could not reach the server. Make sure the backend is running.';
      console.error('Failed to load profile:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onInputChange(): void {
    this.hasChanges = true;
  }

  cancelChanges(): void {
    if (this.originalProfile) {
      this.profile = JSON.parse(JSON.stringify(this.originalProfile));
    }
    this.hasChanges = false;
  }

  async saveChanges(): Promise<void> {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      const res = await firstValueFrom(this.apiService.updateProfile(this.profile));
      if (res.success) {
        alert('Profile updated successfully!');
        this.profile = res.profile;
        this.originalProfile = JSON.parse(JSON.stringify(res.profile));
        this.hasChanges = false;
      } else {
        alert(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      alert('Could not save changes. Please check your connection.');
      console.error('Failed to save profile:', err);
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
    }
    this.router.navigate(['/login']);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

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

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.getProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.profile = res.profile;
          this.originalProfile = JSON.parse(JSON.stringify(res.profile));
        }
      },
      error: (err) => console.error('Failed to load profile', err)
    });
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

  saveChanges(): void {
    this.apiService.updateProfile(this.profile).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Profile updated successfully!');
          this.profile = res.profile;
          this.originalProfile = JSON.parse(JSON.stringify(res.profile));
          this.hasChanges = false;
        }
      },
      error: (err) => console.error('Failed to save profile', err)
    });
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
    }
    this.router.navigate(['/login']);
  }
}

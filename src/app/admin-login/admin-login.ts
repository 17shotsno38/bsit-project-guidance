import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  username = '';
  password = '';
  isLoggingIn = false;
  errorMessage = '';

  constructor(private router: Router, private apiService: ApiService) {}

  async onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoggingIn = true;
    this.errorMessage = '';

    try {
      const res = await firstValueFrom(this.apiService.login({
        username: this.username,
        password: this.password
      }));

      if (res && res.success && res.token) {
        this.saveSession(res.token, res.userId || '');
        this.router.navigate(['/admin']);
      } else {
        this.errorMessage = res?.message || 'Login failed. Please check your credentials.';
      }
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Login failed. Please try again.';
      console.error('Admin login error:', err);
    } finally {
      this.isLoggingIn = false;
    }
  }

  private saveSession(token: string, userId: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('authToken', token || '');
      localStorage.setItem('userId',    userId || '');
    }
  }
}

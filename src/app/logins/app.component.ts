import { Component, AfterViewInit, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { firstValueFrom } from 'rxjs';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnInit {
  isLoggingIn = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const token = localStorage.getItem('authToken');

      // Only attempt auto-redirect if we actually have stored credentials
      if (isLoggedIn === 'true' && token) {
        // Verify the token is still valid against the backend
        this.apiService.verifyToken().subscribe({
          next: (res: any) => {
            if (res && res.success !== false) {
              // Token is valid — redirect based on role
              const role = localStorage.getItem('role');
              const email = localStorage.getItem('userEmail') || '';
              const validAdminEmails = ['jorbeta04647@liceo.edu.ph', 'aencarguez89245@liceo.edu.ph'];
              const isAdminCompatible = validAdminEmails.includes(email);

              this.ngZone.run(() => {
                if (role === 'admin' || isAdminCompatible) {
                  this.router.navigate(['/admin/dashboard']);
                } else {
                  this.router.navigate(['/dashboard']);
                }
              });
            } else {
              // Server returned a non-success result — clear stale session
              this.clearSession();
            }
          },
          error: () => {
            // Token rejected (401/403) or backend unreachable — clear stale session
            this.clearSession();
          }
        });
      } else {
        // No stored credentials at all — clear just in case and stay on login
        this.clearSession();
      }
    }
  }

  private clearSession(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      localStorage.removeItem('userEmail');
    }
  }

  ngAfterViewInit(): void {
    // Wait for the Google script to load before initializing
    this.ngZone.runOutsideAngular(() => {
      let retries = 0;
      const interval = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
          clearInterval(interval);
          this.ngZone.run(() => {
            google.accounts.id.initialize({
              client_id: '383253296227-sfv6cevcukrch0kbnsu5njr9eq7cf4iu.apps.googleusercontent.com',
              callback: this.handleGoogleLogin.bind(this)
            });
            const googleBtn = document.getElementById('google-btn-container');
            if (googleBtn) {
              google.accounts.id.renderButton(googleBtn, { theme: 'outline', size: 'large', width: '100%' });
            }
          });
        } else {
          retries++;
          if (retries > 100) { // Give up after 100 * 50ms = 5 seconds
            clearInterval(interval);
            console.error('Google Sign-In script failed to load.');
          }
        }
      }, 50);
    });
  }

  // Google's callback is NOT async-aware, so we use ngZone.run + firstValueFrom inside
  handleGoogleLogin(response: any): void {
    try {
      const base64Url    = response.credential.split('.')[1];
      const base64       = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload  = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      const payload = JSON.parse(jsonPayload);

      // Re-enter Angular zone so change detection works, then use async/await
      this.ngZone.run(async () => {
        if (this.isLoggingIn) return;
        this.isLoggingIn = true;
        try {
          const res = await firstValueFrom(this.apiService.loginWithGoogle(payload));
          if (res.success) {
            this.saveSession(res.token, res.userId, res.role, payload.email);
            if (res.role === 'admin') {
              this.ngZone.run(() => this.router.navigate(['/admin']));
            } else {
              this.ngZone.run(() => this.router.navigate(['/dashboard']));
            }
          } else {
            alert('Google Login failed: ' + (res.message || 'Server error'));
          }
        } catch (err: any) {
          alert('Google Login failed: ' + (err.error?.message || 'Server error'));
          console.error('Google login error:', err);
        } finally {
          this.isLoggingIn = false;
        }
      });
    } catch (e) {
      console.error('Failed to parse Google JWT:', e);
    }
  }

  private saveSession(token: string, userId: string, role?: string, email?: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('authToken', token || '');
      localStorage.setItem('userId',    userId || '');
      if (role) localStorage.setItem('role', role);
      if (email) localStorage.setItem('userEmail', email);
    }
  }
}
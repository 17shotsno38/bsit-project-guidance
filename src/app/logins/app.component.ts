import { Component, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {

  constructor(private router: Router, private apiService: ApiService, private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '383253296227-sfv6cevcukrch0kbnsu5njr9eq7cf4iu.apps.googleusercontent.com', // Placeholder client ID
        callback: this.handleGoogleLogin.bind(this)
      });
      const googleBtn = document.getElementById('google-btn-container');
      if (googleBtn) {
        google.accounts.id.renderButton(googleBtn, { theme: 'outline', size: 'large', width: '100%' });
      }
    }
  }

  handleGoogleLogin(response: any): void {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);

      this.ngZone.run(() => {
        this.apiService.loginWithGoogle(payload).subscribe({
          next: (res) => {
            if (res.success) {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('isLoggedIn', 'true');
              }
              this.router.navigate(['/dashboard']);
            }
          },
          error: (err) => alert('Google Login failed: ' + (err.error?.message || 'Server error'))
        });
      });
    } catch (e) {
      console.error('Failed to parse Google JWT', e);
    }
  }

  loginAsAdmin(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
    }
    this.router.navigate(['/admin']);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ── Build headers with Bearer token ──────────────────────────────────────────
  private authHeaders(): HttpHeaders {
    const token = typeof localStorage !== 'undefined'
      ? (localStorage.getItem('authToken') || '')
      : '';
    return new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
  }

  // ── Auth ────────────────────────────────────────────────────────────────────
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  loginWithGoogle(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/google`, data);
  }

  private profileSubject = new BehaviorSubject<any>(null);
  public profile$ = this.profileSubject.asObservable();

  // ── Profile ─────────────────────────────────────────────────────────────────
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.authHeaders() }).pipe(
      tap((res: any) => {
        if (res.success && res.profile) {
          this.profileSubject.next(res.profile);
        }
      })
    );
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, { headers: this.authHeaders() }).pipe(
      tap((res: any) => {
        if (res.success && res.profile) {
          this.profileSubject.next(res.profile);
        }
      })
    );
  }

  // ── Student Dashboard ────────────────────────────────────────────────────────
  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`, { headers: this.authHeaders() });
  }

  // ── Queue ────────────────────────────────────────────────────────────────────
  joinQueue(): Observable<any> {
    return this.http.post(`${this.apiUrl}/queue/join`, {}, { headers: this.authHeaders() });
  }

  withdrawQueue(): Observable<any> {
    return this.http.post(`${this.apiUrl}/queue/withdraw`, {}, { headers: this.authHeaders() });
  }

  getMyQueueEntry(): Observable<any> {
    return this.http.get(`${this.apiUrl}/queue/my-entry`, { headers: this.authHeaders() });
  }

  // ── Counselors ───────────────────────────────────────────────────────────────
  getCounselors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/counselors`, { headers: this.authHeaders() });
  }

  // ── Appointments ─────────────────────────────────────────────────────────────
  getAvailableAppointments(date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/available?date=${date}`, { headers: this.authHeaders() });
  }

  bookAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, data, { headers: this.authHeaders() });
  }

  updateAppointment(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${id}`, data, { headers: this.authHeaders() });
  }

  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointments/${id}`, { headers: this.authHeaders() });
  }

  updateAppointmentStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${id}/status`, { status }, { headers: this.authHeaders() });
  }

  getMyAppointments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/mine`, { headers: this.authHeaders() });
  }

  // ── Admin ────────────────────────────────────────────────────────────────────
  getAdminDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/dashboard`, { headers: this.authHeaders() });
  }

  getReports(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/reports`, { headers: this.authHeaders() });
  }

  callStudent(sessionId?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/call`, { sessionId }, { headers: this.authHeaders() });
  }

  // ── Notifications ────────────────────────────────────────────────────────────
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.authHeaders() });
  }

  clearNotifications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications`, { headers: this.authHeaders() });
  }

  // ── Session ──────────────────────────────────────────────────────────────────
  // Validates the stored token by hitting a protected endpoint.
  // Returns the observable so callers can handle success/error themselves.
  verifyToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify`, { headers: this.authHeaders() });
  }

  // ── Health ───────────────────────────────────────────────────────────────────
  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}

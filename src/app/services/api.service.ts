import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  loginWithGoogle(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/google`, data);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  joinQueue(): Observable<any> {
    return this.http.post(`${this.apiUrl}/queue/join`, {});
  }

  getAvailableAppointments(date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/available?date=${date}`);
  }

  bookAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, data);
  }

  getAdminDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/dashboard`);
  }

  callStudent(sessionId?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/call`, { sessionId });
  }
}

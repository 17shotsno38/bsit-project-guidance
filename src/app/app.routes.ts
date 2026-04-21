import { Routes } from '@angular/router';
import { AppComponent } from './logins/app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { StudentDashboardContent } from './student-dashboard-content/student-dashboard-content';
import { Analytics } from './analytics/analytics';
import { AppointmentsComponent } from './appointments/appointments.component';
import { AdminDashboardContent } from './admin-dashboard-content/admin-dashboard-content';
import { AdminAppointments } from './admin-appointments/admin-appointments';

import { studentGuard } from './student.guard';

export const routes: Routes = [
  { path: '', component: AppComponent, pathMatch: 'full' },
  { path: 'login', component: AppComponent },
  { 
    path: '', 
    component: DashboardComponent, 
    canActivate: [authGuard, studentGuard],
    children: [
      { path: 'dashboard', component: StudentDashboardContent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardContent },
      { path: 'appointments', component: AdminAppointments },
      { path: 'analytics', component: Analytics }
    ]
  }
];

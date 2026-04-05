import { Routes } from '@angular/router';
import { AppComponent } from './logins/app.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AppComponent },
  { path: 'dashboard', component: DashboardComponent },
];
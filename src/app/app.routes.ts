import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'login', component: AppComponent },
  { path: 'dashboard', component: DashboardComponent },
];

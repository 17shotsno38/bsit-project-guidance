import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  activeNav = 'dashboard';

  counselor = {
    name: 'Dr. Sioney R. Lina',
    title: 'Guidance Counselor',
    avatar: 'https://i.pravatar.cc/80?img=47',
    id: 'GC-47890'
  };

  availabilityStatus: 'online' | 'on-break' | 'offline' = 'online';

  availabilityOptions = [
    { value: 'online',   label: 'Online',    color: '#16a34a' },
    { value: 'on-break', label: 'On Break',  color: '#d97706' },
    { value: 'offline',  label: 'Offline',   color: '#6b7280' }
  ];

  showAvailabilityDropdown = false;

  queueData = {
    estimatedWait: '24 mins',
    studentsAhead: 3,
    isActive: true
  };

  upcomingSessions = [
    {
      id: 1,
      studentName: 'Maria Clara',
      tag: 'COUNSELING',
      detail: 'Guidance Office · Today, 2:00 PM',
      avatar: 'https://i.pravatar.cc/48?img=5'
    },
    {
      id: 2,
      studentName: 'Juan dela Cruz',
      tag: 'ACADEMIC',
      detail: 'Guidance Office · Today, 3:30 PM',
      avatar: 'https://i.pravatar.cc/48?img=12'
    },
    {
      id: 3,
      studentName: 'Ana Santos',
      tag: 'COUNSELING',
      detail: 'Guidance Office · Tomorrow, 9:00 AM',
      avatar: 'https://i.pravatar.cc/48?img=9'
    }
  ];

  todayStats = {
    totalSessions: 8,
    completed: 5,
    pending: 3,
    walkinQueue: 3
  };

  constructor(private router: Router) {}

  ngOnInit(): void {}

  setActive(nav: string): void {
    this.activeNav = nav;
  }

  get currentAvailability() {
    return this.availabilityOptions.find(o => o.value === this.availabilityStatus)!;
  }

  selectAvailability(value: string): void {
    this.availabilityStatus = value as 'online' | 'on-break' | 'offline';
    this.showAvailabilityDropdown = false;
  }

  toggleAvailabilityDropdown(): void {
    this.showAvailabilityDropdown = !this.showAvailabilityDropdown;
  }

  callNextStudent(): void {
    if (this.queueData.studentsAhead > 0) {
      this.queueData.studentsAhead--;
      if (this.queueData.studentsAhead === 0) {
        this.queueData.isActive = false;
        this.queueData.estimatedWait = '0 mins';
      }
    }
  }

  reschedule(session: any): void {
    alert(`Reschedule requested for ${session.studentName}`);
  }

  cancelSession(session: any): void {
    this.upcomingSessions = this.upcomingSessions.filter(s => s.id !== session.id);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}

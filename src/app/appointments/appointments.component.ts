import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { firstValueFrom } from 'rxjs';
import { ElementRef, HostListener } from '@angular/core';

export interface Counselor {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit {
  availableSlots: any[] = [];
  selectedTime: string = '';
  selectedDate: string = '';
  selectedPeriod: string = 'Morning';

  months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  displayMonth = new Date().getMonth();
  displayYear  = new Date().getFullYear();

  calendarDays: number[] = [];
  paddingDays:  number[] = [];
  selectedFullDate: Date | null = null;
  rescheduleId: string | null = null;

  isLoadingSlots   = false;
  isConfirming     = false;
  errorMessage     = '';
  slotsError       = '';

  counselors: Counselor[] = [];
  selectedCounselor: Counselor | null = null;

  isMonthDropdownOpen = false;
  isYearDropdownOpen = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private eRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.isMonthDropdownOpen = false;
      this.isYearDropdownOpen = false;
    }
  }

  async ngOnInit(): Promise<void> {
    await this.loadCounselors();

    // Read rescheduleId from query params (one-shot, no need to unsubscribe on a route)
    const params = await firstValueFrom(this.route.queryParams);
    this.rescheduleId = params['rescheduleId'] || null;

    this.generateCalendar();
    await this.selectCalendarDate(new Date().getDate()); // Default: today
  }

  async loadCounselors(): Promise<void> {
    try {
      const res = await firstValueFrom(this.apiService.getCounselors());
      if (res.success && res.counselors) {
        this.counselors = res.counselors;
        if (this.counselors.length > 0) {
          this.selectedCounselor = this.counselors[0];
        }
      }
    } catch (err) {
      console.error('Failed to load counselors:', err);
    }
  }

  generateCalendar(): void {
    this.displayMonth = Number(this.displayMonth);
    this.displayYear = Number(this.displayYear);
    const firstDay    = new Date(this.displayYear, this.displayMonth, 1).getDay();
    const daysInMonth = new Date(this.displayYear, this.displayMonth + 1, 0).getDate();
    this.paddingDays  = Array(firstDay).fill(0);
    this.calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  async prevMonth(): Promise<void> {
    this.displayMonth--;
    if (this.displayMonth < 0) { this.displayMonth = 11; this.displayYear--; }
    this.generateCalendar();
    if (this.selectedFullDate) {
      await this.selectCalendarDate(this.selectedFullDate.getDate());
    }
  }

  async nextMonth(): Promise<void> {
    this.displayMonth++;
    if (this.displayMonth > 11) { this.displayMonth = 0; this.displayYear++; }
    this.generateCalendar();
    if (this.selectedFullDate) {
      await this.selectCalendarDate(this.selectedFullDate.getDate());
    }
  }

  toggleMonthDropdown(event: Event) {
    event.stopPropagation();
    this.isMonthDropdownOpen = !this.isMonthDropdownOpen;
    this.isYearDropdownOpen = false;
  }

  toggleYearDropdown(event: Event) {
    event.stopPropagation();
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
    this.isMonthDropdownOpen = false;
  }

  selectMonth(i: number, event: Event) {
    event.stopPropagation();
    this.displayMonth = i;
    this.isMonthDropdownOpen = false;
    this.generateCalendar();
  }

  selectYear(year: number, event: Event) {
    event.stopPropagation();
    this.displayYear = year;
    this.isYearDropdownOpen = false;
    this.generateCalendar();
  }

  async selectCalendarDate(day: number): Promise<void> {
    this.selectedFullDate = new Date(this.displayYear, this.displayMonth, day);
    this.selectedDate     = `${this.months[this.displayMonth]} ${day}, ${this.displayYear}`;
    this.selectedTime     = '';
    await this.loadSlots();
  }

  isSelectedDate(day: number): boolean {
    if (!this.selectedFullDate) return false;
    return (
      this.selectedFullDate.getDate()     === day &&
      this.selectedFullDate.getMonth()    == this.displayMonth &&
      this.selectedFullDate.getFullYear() == this.displayYear
    );
  }

  async loadSlots(): Promise<void> {
    this.isLoadingSlots = true;
    this.slotsError = '';
    try {
      const res = await firstValueFrom(this.apiService.getAvailableAppointments(this.selectedDate));
      if (res.success) {
        this.availableSlots = res.slots;
      } else {
        this.slotsError = res.message || 'Could not load available slots.';
      }
    } catch (err: any) {
      this.slotsError = 'Failed to load slots. Check your connection.';
      console.error('Failed to load slots:', err);
    } finally {
      this.isLoadingSlots = false;
      this.cdr.detectChanges();
    }
  }

  get displayedSlots() {
    return this.availableSlots.filter(slot =>
      this.selectedPeriod === 'Morning' ? slot.time.includes('AM') : slot.time.includes('PM')
    );
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
  }

  selectSlot(time: string, available: boolean): void {
    if (!available) return;
    this.selectedTime = time;
  }

  selectCounselor(counselor: Counselor): void {
    this.selectedCounselor = counselor;
  }

  async confirmAppointment(): Promise<void> {
    if (!this.selectedTime || this.isConfirming) return;
    this.isConfirming = true;
    this.errorMessage = '';
    try {
      const payload: any = {
        counselorName: this.selectedCounselor?.name || 'Dr. Sioney Lina',
        avatar: this.selectedCounselor?.avatar || 'https://i.pravatar.cc/80?img=9',
        date: this.selectedDate,
        time: this.selectedTime
      };

      if (this.rescheduleId) {
        const res = await firstValueFrom(
          this.apiService.updateAppointment(this.rescheduleId, payload)
        );
        if (res.success) {
          alert('Appointment rescheduled!');
          this.ngZone.run(() => this.router.navigate(['/dashboard']));
        } else {
          this.errorMessage = res.message || 'Failed to reschedule appointment.';
        }
      } else {
        const res = await firstValueFrom(
          this.apiService.bookAppointment(payload)
        );
        if (res.success) {
          const qNum = res.appointment?.queueNumber || 'N/A';
          alert(`Appointment confirmed! Your queue number is: ${qNum}`);
          this.ngZone.run(() => this.router.navigate(['/dashboard']));
        } else {
          this.errorMessage = res.message || 'Failed to book appointment.';
        }
      }
    } catch (err: any) {
      this.errorMessage = 'Could not complete request. Please check your connection.';
      console.error('Failed to confirm appointment:', err);
    } finally {
      this.isConfirming = false;
      this.cdr.detectChanges();
    }
  }
}

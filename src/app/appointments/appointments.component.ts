import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

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

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years = Array.from({length: 5}, (_, i) => new Date().getFullYear() + i);
  
  displayMonth = new Date().getMonth();
  displayYear = new Date().getFullYear();
  
  calendarDays: number[] = [];
  paddingDays: number[] = [];
  selectedFullDate: Date | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.generateCalendar();
    this.selectCalendarDate(new Date().getDate()); // Default select today
  }

  generateCalendar(): void {
    const firstDay = new Date(this.displayYear, this.displayMonth, 1).getDay();
    const daysInMonth = new Date(this.displayYear, this.displayMonth + 1, 0).getDate();

    this.paddingDays = Array(firstDay).fill(0);
    this.calendarDays = Array.from({length: daysInMonth}, (_, i) => i + 1);
  }

  prevMonth(): void {
    this.displayMonth--;
    if (this.displayMonth < 0) {
      this.displayMonth = 11;
      this.displayYear--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    this.displayMonth++;
    if (this.displayMonth > 11) {
      this.displayMonth = 0;
      this.displayYear++;
    }
    this.generateCalendar();
  }

  selectCalendarDate(day: number): void {
    this.selectedFullDate = new Date(this.displayYear, this.displayMonth, day);
    this.selectedDate = `${this.months[this.displayMonth]} ${day}, ${this.displayYear}`;
    this.loadSlots();
  }

  isSelectedDate(day: number): boolean {
    if (!this.selectedFullDate) return false;
    return this.selectedFullDate.getDate() === day &&
           this.selectedFullDate.getMonth() === this.displayMonth &&
           this.selectedFullDate.getFullYear() === this.displayYear;
  }

  loadSlots(): void {
    this.apiService.getAvailableAppointments(this.selectedDate).subscribe({
      next: (res) => {
        if (res.success) {
          this.availableSlots = res.slots;
        }
      },
      error: (err) => console.error('Failed to load slots', err)
    });
  }

  get displayedSlots() {
    return this.availableSlots.filter(slot => {
      if (this.selectedPeriod === 'Morning') {
        return slot.time.includes('AM');
      } else {
        return slot.time.includes('PM');
      }
    });
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
  }

  selectSlot(time: string, available: boolean): void {
    if (!available) return;
    this.selectedTime = time;
  }

  confirmAppointment(): void {
    if (!this.selectedTime) return;
    this.apiService.bookAppointment({
      counselorName: 'Dr. Sioney Lina',
      date: this.selectedDate,
      time: this.selectedTime
    }).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Appointment confirmed!');
          this.selectedTime = '';
          this.loadSlots(); // reload
        }
      },
      error: (err) => console.error('Failed to book', err)
    });
  }
}

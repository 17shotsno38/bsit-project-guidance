import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class Analytics implements OnInit {
  dailyChartData:   any[] = [];
  monthlyChartData: any[] = [];
  isLoading   = true;
  errorMessage = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.loadReports();
  }

  async loadReports(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const res = await firstValueFrom(this.apiService.getReports());
      if (res.success) {
        this.dailyChartData   = res.daily   ?? [];
        this.monthlyChartData = res.monthly ?? [];
      } else {
        this.errorMessage = res.message || 'Failed to load reports.';
      }
    } catch (err: any) {
      this.errorMessage = 'Could not reach the server. Make sure the backend is running.';
      console.error('Failed to load reports:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  exportDailyCSV(): void {
    this.downloadCSV(this.dailyChartData, 'daily_statistics.csv');
  }

  exportMonthlyCSV(): void {
    this.downloadCSV(this.monthlyChartData, 'monthly_statistics.csv');
  }

  private downloadCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }
    const keys       = Object.keys(data[0]);
    const csvContent = [
      keys.join(','),
      ...data.map(row => keys.map(k => row[k]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);   // free memory
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _dark = new BehaviorSubject<boolean>(false);
  isDark$ = this._dark.asObservable();

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme');
      const isDark = saved === 'dark';
      this._dark.next(isDark);
      this.applyBodyClass(isDark);
    }
  }

  get isDark(): boolean {
    return this._dark.value;
  }

  toggle(): void {
    const next = !this._dark.value;
    this._dark.next(next);
    this.applyBodyClass(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    }
  }

  private applyBodyClass(isDark: boolean): void {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
  }
}

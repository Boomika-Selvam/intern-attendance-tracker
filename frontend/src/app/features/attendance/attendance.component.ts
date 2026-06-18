import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { StorageService } from '../../core/services/storage.service';
import { Intern } from '../../core/models/intern.model';
import { Attendance } from '../../core/models/attendance.model';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit, OnDestroy {
  intern: Intern | null = null;
  todayRecord: Attendance | null = null;
  loading = true;
  actionLoading = false;
  private notificationTimer: any;
  private lastShownNotificationCount = 0;

  constructor(private api: ApiService, private storage: StorageService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    if (this.notificationTimer) {
      clearInterval(this.notificationTimer);
    }
  }

  get photoUrl(): string {
    return this.intern ? this.api.imageUrl(this.intern.photoUrl) : '';
  }

  get canLogin(): boolean {
    return !this.todayRecord;
  }

  get canLogout(): boolean {
    return !!this.todayRecord && this.todayRecord.isLoggedIn;
  }

  get completedToday(): boolean {
    return !!this.todayRecord && !this.todayRecord.isLoggedIn && !!this.todayRecord.logoutTime;
  }

  load(): void {
    const internId = this.storage.getInternId();
    if (!internId) {
      return;
    }

    const today = this.todayKey();
    this.loading = true;
    forkJoin([this.api.getIntern(internId), this.api.getAttendance(internId, today)]).subscribe(
      ([intern, records]) => {
        this.intern = intern;
        this.todayRecord = records.length ? records[0] : null;
        this.loading = false;
        this.showPendingNotification();
        this.configureNotificationPolling();
      },
      () => {
        this.loading = false;
        this.snackBar.open('Could not load attendance details', 'Close', { duration: 4000 });
      }
    );
  }

  login(): void {
    if (!this.intern) {
      return;
    }
    this.actionLoading = true;
    this.api.login(this.intern.internId).subscribe(
      ({ attendance }) => {
        this.todayRecord = attendance;
        this.actionLoading = false;
        this.configureNotificationPolling();
        this.snackBar.open('Login successful', 'Close', { duration: 3000 });
      },
      (error) => this.handleActionError(error)
    );
  }

  logout(): void {
    if (!this.intern) {
      return;
    }
    this.actionLoading = true;
    this.api.logout(this.intern.internId).subscribe(
      ({ attendance }) => {
        this.todayRecord = attendance;
        this.actionLoading = false;
        this.configureNotificationPolling();
        this.snackBar.open('Logout successful', 'Close', { duration: 3000 });
      },
      (error) => this.handleActionError(error)
    );
  }

  private showPendingNotification(): void {
    if (!this.todayRecord || !this.todayRecord.notificationSent) {
      return;
    }
    const currentCount = this.todayRecord.notificationCount || 0;
    if (currentCount <= this.lastShownNotificationCount) {
      return;
    }
    this.lastShownNotificationCount = currentCount;
    const message =
      this.todayRecord.notificationType === 'still_logged_in'
        ? 'You have been logged in for 4 hours and are still logged in'
        : 'Logged out';
    this.snackBar.open(message, 'Close', { duration: 6000 });
  }

  private configureNotificationPolling(): void {
    if (this.notificationTimer) {
      clearInterval(this.notificationTimer);
      this.notificationTimer = null;
    }

    if (!this.intern || !this.todayRecord?.isLoggedIn) {
      return;
    }

    this.notificationTimer = setInterval(() => {
      const today = this.todayKey();
      this.api.getAttendance(this.intern!.internId, today).subscribe((records) => {
        this.todayRecord = records.length ? records[0] : this.todayRecord;
        this.showPendingNotification();
      });
    }, 60000);
  }

  private todayKey(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private handleActionError(error: any): void {
    this.actionLoading = false;
    this.snackBar.open(error.error?.message || 'Attendance action failed', 'Close', { duration: 4000 });
  }
}
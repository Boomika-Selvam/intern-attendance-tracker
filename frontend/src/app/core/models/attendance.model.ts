export interface Attendance {
  _id?: string;
  attendanceId: string;
  internId: string;
  attendanceDate?: string;
  loginTime: string;
  logoutTime?: string;
  totalWorkingHours: number;
  isLoggedIn: boolean;
  notificationSent: boolean;
  notificationCount?: number;
  lastNotificationAt?: string;
  nextNotificationAt?: string;
  notificationType?: 'still_logged_in' | 'logged_out';
  createdAt?: string;
}

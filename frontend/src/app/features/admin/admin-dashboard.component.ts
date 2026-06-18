import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Intern } from '../../core/models/intern.model';
import { Attendance } from '../../core/models/attendance.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  filters = this.fb.group({
    internId: [''],
    date: [''],
    currentlyLoggedIn: [false]
  });
  interns: Intern[] = [];
  attendance: Attendance[] = [];
  internColumns = ['internId', 'name', 'createdAt'];
  attendanceColumns = ['internId', 'loginTime', 'logoutTime', 'totalWorkingHours', 'isLoggedIn', 'notificationType'];

  constructor(private fb: FormBuilder, public api: ApiService) {}

  ngOnInit(): void {
    this.loadInterns();
    this.loadAttendance();
  }

  loadInterns(): void {
    this.api.getInterns(this.filters.value.internId || '').subscribe((interns) => (this.interns = interns));
  }

  loadAttendance(): void {
    const value = this.filters.value;
    this.api
      .getAttendance(value.internId || '', value.date || '', !!value.currentlyLoggedIn)
      .subscribe((records) => (this.attendance = records));
  }

  applyFilters(): void {
    this.loadInterns();
    this.loadAttendance();
  }

  reset(): void {
    this.filters.reset({ internId: '', date: '', currentlyLoggedIn: false });
    this.applyFilters();
  }

  export(type: 'excel' | 'pdf'): void {
    window.open(this.api.exportUrl(type, this.filters.value.internId || ''), '_blank');
  }
}

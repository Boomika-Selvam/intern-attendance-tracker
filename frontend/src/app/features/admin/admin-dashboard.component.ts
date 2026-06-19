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
  attendanceColumns = ['internId', 'name', 'loginTime', 'logoutTime', 'totalWorkingHours', 'isLoggedIn', 'notificationType'];

  constructor(private fb: FormBuilder, public api: ApiService) {}

  ngOnInit(): void {
    this.loadInterns();
    this.loadAttendance();
  }

  loadInterns(): void {
  const value = this.filters.value;
  const internSearch = value.internId || '';

  if (value.currentlyLoggedIn) {
    this.api.getAttendance(internSearch, value.date || '', true).subscribe((records) => {
      const activeInternIds = records.map((record) => record.internId);

      this.api.getInterns(internSearch).subscribe((interns) => {
        this.interns = interns.filter((intern) => activeInternIds.includes(intern.internId));
      });
    });

    return;
  }

  this.api.getInterns(internSearch).subscribe((interns) => (this.interns = interns));
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
  const value = this.filters.value;

  window.open(
    this.api.exportUrl(
      type,
      value.internId || '',
      value.date || '',
      !!value.currentlyLoggedIn
    ),
    '_blank'
  );
}
}

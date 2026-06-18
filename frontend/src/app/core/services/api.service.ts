import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Intern } from '../models/intern.model';
import { Attendance } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  register(formData: FormData): Observable<{ message: string; intern: Intern }> {
    return this.http.post<{ message: string; intern: Intern }>(`${environment.apiUrl}/register`, formData);
  }

  getInterns(search = ''): Observable<Intern[]> {
    const params = search ? new HttpParams().set('search', search) : undefined;
    return this.http.get<Intern[]>(`${environment.apiUrl}/interns`, { params });
  }

  getIntern(internId: string): Observable<Intern> {
    return this.http.get<Intern>(`${environment.apiUrl}/interns/${internId}`);
  }

  login(internId: string): Observable<{ message: string; attendance: Attendance }> {
    return this.http.post<{ message: string; attendance: Attendance }>(`${environment.apiUrl}/login`, { internId });
  }

  logout(internId: string): Observable<{ message: string; attendance: Attendance }> {
    return this.http.post<{ message: string; attendance: Attendance }>(`${environment.apiUrl}/logout`, { internId });
  }

  getAttendance(internId = '', date = '', currentlyLoggedIn = false): Observable<Attendance[]> {
    let params = new HttpParams();
    if (internId) {
      params = params.set('internId', internId);
    }
    if (date) {
      params = params.set('date', date);
    }
    if (currentlyLoggedIn) {
      params = params.set('currentlyLoggedIn', 'true');
    }
    return this.http.get<Attendance[]>(`${environment.apiUrl}/attendance`, { params });
  }

  exportUrl(type: 'excel' | 'pdf', internId = ''): string {
    const suffix = internId ? `?internId=${encodeURIComponent(internId)}` : '';
    return `${environment.apiUrl}/export/${type}${suffix}`;
  }

  imageUrl(photoUrl: string): string {
  if (!photoUrl) {
    return '';
  }

  if (photoUrl.startsWith('data:') || photoUrl.startsWith('http')) {
    return photoUrl;
  }

  return `${environment.assetBaseUrl}${photoUrl}`;
}
}

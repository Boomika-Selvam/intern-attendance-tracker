import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './features/registration/registration.component';
import { ScannerComponent } from './features/scanner/scanner.component';
import { AttendanceComponent } from './features/attendance/attendance.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { GuestGuard } from './core/guards/guest.guard';
import { RegisteredGuard } from './core/guards/registered.guard';

const routes: Routes = [
  { path: 'register', component: RegistrationComponent, canActivate: [GuestGuard] },
  { path: 'scan', component: ScannerComponent, canActivate: [RegisteredGuard] },
  { path: 'attendance', component: AttendanceComponent, canActivate: [RegisteredGuard] },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '', redirectTo: 'scan', pathMatch: 'full' },
  { path: '**', redirectTo: 'scan' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

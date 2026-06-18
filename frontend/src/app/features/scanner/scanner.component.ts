import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class ScannerComponent {
  hasPermission = false;
  scannerEnabled = true;
  allowedTokens = ['attendance', '/attendance', 'intern-attendance'];

  constructor(private router: Router, private snackBar: MatSnackBar) {}

  onPermissionResponse(permission: boolean): void {
    this.hasPermission = permission;
    if (!permission) {
      this.snackBar.open('Camera permission is required for scanning', 'Close', { duration: 4000 });
    }
  }

  onScanSuccess(result: string): void {
    const valid = this.allowedTokens.some((token) => result.toLowerCase().includes(token));
    if (!valid) {
      this.snackBar.open('Invalid QR code for this attendance portal', 'Close', { duration: 4000 });
      return;
    }

    this.scannerEnabled = false;
    this.router.navigateByUrl('/attendance');
  }
}

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
    const scannedValue = String(result || '').toLowerCase();
    const valid = this.allowedTokens.some((token) => scannedValue.includes(token));

    if (!valid) {
      this.snackBar.open('Incorrect QR code. Please scan the attendance QR.', 'Close', { duration: 4000 });
      return;
    }

    this.scannerEnabled = false;
    this.snackBar.open('QR verified successfully', 'Close', { duration: 1500 });
    this.router.navigateByUrl('/attendance');
  }

  continueAfterScan(): void {
    this.snackBar.open('No valid QR found. Please scan the attendance QR first.', 'Close', { duration: 4000 });
  }
}
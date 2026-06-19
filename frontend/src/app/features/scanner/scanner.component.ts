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
  validQrScanned = false;
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
      this.validQrScanned = false;
      this.snackBar.open('Incorrect QR code. Please scan the attendance QR.', 'Close', { duration: 4000 });
      return;
    }

    this.validQrScanned = true;
    this.scannerEnabled = false;
    this.snackBar.open('QR verified successfully. You can continue now.', 'Close', { duration: 3000 });
  }

  continueAfterScan(): void {
    if (!this.validQrScanned) {
      this.snackBar.open('No valid QR found. Please scan the attendance QR first.', 'Close', { duration: 4000 });
      return;
    }

    this.router.navigateByUrl('/attendance');
  }
}
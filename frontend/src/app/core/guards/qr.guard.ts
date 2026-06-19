import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class QrGuard implements CanActivate {
  constructor(
    private storage: StorageService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.storage.isQrVerified()) {
      return true;
    }

    this.snackBar.open('Please scan the valid attendance QR first', 'Close', { duration: 4000 });
    return this.router.parseUrl('/scan');
  }
}
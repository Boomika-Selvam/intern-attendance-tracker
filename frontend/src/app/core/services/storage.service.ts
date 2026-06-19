import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly internIdKey = 'internId';
  private readonly qrVerifiedKey = 'qrVerified';

  getInternId(): string | null {
    return localStorage.getItem(this.internIdKey);
  }

  setInternId(internId: string): void {
    localStorage.setItem(this.internIdKey, internId);
  }

  setQrVerified(): void {
    sessionStorage.setItem(this.qrVerifiedKey, 'true');
  }

  isQrVerified(): boolean {
    return sessionStorage.getItem(this.qrVerifiedKey) === 'true';
  }

  clearQrVerified(): void {
    sessionStorage.removeItem(this.qrVerifiedKey);
  }

  clear(): void {
    localStorage.removeItem(this.internIdKey);
    sessionStorage.removeItem(this.qrVerifiedKey);
  }
}
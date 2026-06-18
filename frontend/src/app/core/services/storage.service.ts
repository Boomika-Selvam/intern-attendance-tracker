import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly internIdKey = 'internId';

  getInternId(): string | null {
    return localStorage.getItem(this.internIdKey);
  }

  setInternId(internId: string): void {
    localStorage.setItem(this.internIdKey, internId);
  }

  clear(): void {
    localStorage.removeItem(this.internIdKey);
  }
}

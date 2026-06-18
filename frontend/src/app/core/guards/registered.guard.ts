import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class RegisteredGuard implements CanActivate {
  constructor(private storage: StorageService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.storage.getInternId() ? true : this.router.parseUrl('/register');
  }
}

import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    photo: [null, Validators.required]
  });
  previewUrl = '';
  loading = false;
  private photoFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private storage: StorageService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (!file) {
      return;
    }
    this.photoFile = file;
    this.form.patchValue({ photo: file as any });
    this.form.get('photo')?.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = String(reader.result));
    reader.readAsDataURL(file);
  }

  submit(): void {
  if (!this.photoFile) {
    this.form.markAllAsTouched();
    this.snackBar.open('Please upload a profile photo', 'Close', { duration: 4000 });
    return;
  }

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 4000 });
    return;
  }

    const formData = new FormData();
    formData.append('name', this.form.value.name);
    formData.append('photo', this.photoFile);

    this.loading = true;
    this.api.register(formData).subscribe(
      ({ intern }) => {
        this.storage.setInternId(intern.internId);
        this.snackBar.open(`Registered as ${intern.internId}`, 'Close', { duration: 3000 });
        this.router.navigateByUrl('/scan');
      },
      (error) => {
        this.loading = false;
        this.snackBar.open(error.error?.message || 'Registration failed', 'Close', { duration: 4000 });
      }
    );
  }
}

// src/app/features/profile/profile.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileInfoComponent } from '../profile-info/profile-info';
import { ProfileEditComponent } from '../profile-edit/profile-edit';
import { ChangePasswordComponent } from '../change-password/change-password';
import { ProfileService, UserProfile } from '../../../services/profile';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ProfileInfoComponent, ProfileEditComponent, ChangePasswordComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  isLoading = true;
  isEditing = false;
  isChangingPassword = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private profileService: ProfileService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); 
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải thông tin';
        this.isLoading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  onEdit(): void {
    this.isEditing = true;
    this.cdr.detectChanges();
  }

  onCancelEdit(): void {
    this.isEditing = false;
    this.cdr.detectChanges();
  }

  onSaveProfile(updatedData: { fullName: string; email: string }): void {
    this.profileService.updateProfile(updatedData).subscribe({
      next: (res) => {
        if (this.profile) {
          this.profile.fullName = updatedData.fullName;
          this.profile.email = updatedData.email;
          localStorage.setItem('fullName', updatedData.fullName);
          this.successMessage = 'Cập nhật thành công';
        }
        this.isEditing = false;
        this.cdr.detectChanges();
        setTimeout(() => { 
          this.successMessage = ''; 
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Cập nhật thất bại';
        this.cdr.detectChanges();
        setTimeout(() => { 
          this.errorMessage = ''; 
          this.cdr.detectChanges();
        }, 3000);
      }
    });
  }

  openChangePassword(): void {
    this.isChangingPassword = true;
    this.cdr.detectChanges();
  }

  closeChangePassword(): void {
    this.isChangingPassword = false;
    this.cdr.detectChanges();
  }

  onChangePasswordSuccess(message: string): void {
    this.successMessage = message;
    this.isChangingPassword = false;
    this.cdr.detectChanges();
    setTimeout(() => { 
      this.successMessage = ''; 
      this.cdr.detectChanges();
    }, 3000);
  }

  onChangePasswordError(message: string): void {
    this.errorMessage = message;
    this.cdr.detectChanges();
    setTimeout(() => { 
      this.errorMessage = ''; 
      this.cdr.detectChanges();
    }, 3000);
  }

  getRoleDisplayName(): string {
    const role = this.authService.getUserRole();
    if (role === 'Admin') return 'Quản trị viên';
    if (role === 'Lecturer') return 'Giảng viên';
    return '';
  }
}
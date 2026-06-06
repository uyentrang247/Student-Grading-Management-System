import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProfileService, UserProfile } from '../../services/profile';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  
  editForm = { fullName: '', email: '' };
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  passwordError = { currentPassword: '', newPassword: '', confirmPassword: '' };
  
  showPassword = {
    current: false,
    new: false,
    confirm: false
  };
  
  constructor(
    private profileService: ProfileService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.loadProfile();
  }
  
  loadProfile(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.errorMessage = '';
    
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.editForm = { fullName: data.fullName, email: data.email };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Không thể tải thông tin. Vui lòng đăng nhập lại.';
        this.isLoading = false;
        this.cdr.detectChanges();
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
        setTimeout(() => { this.errorMessage = ''; this.cdr.detectChanges(); }, 3000);
      }
    });
  }
  
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.profile) {
      this.editForm = { fullName: this.profile.fullName, email: this.profile.email };
      this.errorMessage = '';
      this.successMessage = '';
    }
    this.cdr.detectChanges();
  }
  
  saveProfile(): void {
    if (!this.editForm.fullName.trim()) {
      this.errorMessage = 'Họ tên không được để trống';
      this.cdr.detectChanges();
      setTimeout(() => { this.errorMessage = ''; this.cdr.detectChanges(); }, 3000);
      return;
    }
    
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!this.editForm.email.trim()) {
      this.errorMessage = 'Email không được để trống';
      this.cdr.detectChanges();
      setTimeout(() => { this.errorMessage = ''; this.cdr.detectChanges(); }, 3000);
      return;
    }
    if (!emailRegex.test(this.editForm.email)) {
      this.errorMessage = 'Email không đúng định dạng (ví dụ: ten@domain.com)';
      this.cdr.detectChanges();
      setTimeout(() => { this.errorMessage = ''; this.cdr.detectChanges(); }, 3000);
      return;
    }
    
    this.profileService.updateProfile(this.editForm).subscribe({
      next: (res) => {
        if (this.profile) {
          this.profile.fullName = this.editForm.fullName;
          this.profile.email = this.editForm.email;
          localStorage.setItem('fullName', this.editForm.fullName);
          this.successMessage = res.message || 'Cập nhật thành công';
        }
        this.isEditing = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Cập nhật thất bại';
        this.cdr.detectChanges();
        setTimeout(() => { this.errorMessage = ''; this.cdr.detectChanges(); }, 3000);
      }
    });
  }
  
  openChangePassword(): void {
    this.isChangingPassword = true;
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.passwordError = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.showPassword = { current: false, new: false, confirm: false };
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }
  
  closeChangePassword(): void {
    this.isChangingPassword = false;
    this.passwordError = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.cdr.detectChanges();
  }
  
  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    this.showPassword[field] = !this.showPassword[field];
    this.cdr.detectChanges();
  }
  
  validatePasswordForm(): boolean {
    let isValid = true;
    this.passwordError = { currentPassword: '', newPassword: '', confirmPassword: '' };
    
    if (!this.passwordForm.currentPassword) {
      this.passwordError.currentPassword = 'Vui lòng nhập mật khẩu cũ';
      isValid = false;
    }
    
    if (!this.passwordForm.newPassword) {
      this.passwordError.newPassword = 'Vui lòng nhập mật khẩu mới';
      isValid = false;
    } else if (this.passwordForm.newPassword.length < 6) {
      this.passwordError.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      isValid = false;
    }
    
    if (!this.passwordForm.confirmPassword) {
      this.passwordError.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
      isValid = false;
    } else if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }
    
    this.cdr.detectChanges();
    return isValid;
  }
  
  changePassword(): void {
    if (!this.validatePasswordForm()) {
      return;
    }
    
    this.profileService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Đổi mật khẩu thành công';
        this.closeChangePassword();
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        if (err.error?.message) {
          this.passwordError.currentPassword = err.error.message;
        } else {
          this.errorMessage = err.error?.message || 'Đổi mật khẩu thất bại';
        }
        this.cdr.detectChanges();
        setTimeout(() => { 
          this.errorMessage = ''; 
          this.passwordError.currentPassword = '';
          this.cdr.detectChanges(); 
        }, 3000);
      }
    });
  }
  
  getRoleDisplayName(): string {
    const role = this.authService.getUserRole();
    if (role === 'Admin') return 'Quản trị viên';
    if (role === 'Lecturer') return 'Giảng viên';
    return '';
  }
}
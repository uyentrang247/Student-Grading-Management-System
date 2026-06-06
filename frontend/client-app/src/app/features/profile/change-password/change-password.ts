import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profile';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
export class ChangePasswordComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<string>();
  @Output() error = new EventEmitter<string>();

  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  passwordError = { currentPassword: '', newPassword: '', confirmPassword: '' };
  showPassword = { current: false, new: false, confirm: false };

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  onClose(): void {
    this.resetForm();
    this.close.emit();
    this.cdr.detectChanges();
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    this.showPassword[field] = !this.showPassword[field];
    this.cdr.detectChanges();
  }

  resetForm(): void {
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.passwordError = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.cdr.detectChanges();
  }

  validateForm(): boolean {
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

  onChangePassword(): void {
    if (!this.validateForm()) {
      return;
    }

    this.profileService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: (res) => {
        this.success.emit(res.message || 'Đổi mật khẩu thành công');
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.error?.message) {
          this.passwordError.currentPassword = err.error.message;
        } else {
          this.error.emit(err.error?.message || 'Đổi mật khẩu thất bại');
        }
        this.cdr.detectChanges();
      }
    });
  }
}
import { Component, ChangeDetectorRef } from '@angular/core'; // Gộp lại cho gọn
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  tempPass: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // Đã thêm dấu phẩy giữa các tham số
  constructor(
    private authService: AuthService, 
    private cdr: ChangeDetectorRef 
  ) {}

  onSubmit() {
    if (!this.email) return;
    this.isLoading = true;
    this.message = '';
    this.errorMessage = '';
    this.tempPass = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = res.message;
        this.tempPass = res.temporaryPassword;
        
        // Gọi hàm này để ép Angular cập nhật lại giao diện ngay khi nhận dữ liệu
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Có lỗi xảy ra!';
        // Cập nhật lại giao diện khi có lỗi
        this.cdr.detectChanges(); 
      }
    });
  }
}
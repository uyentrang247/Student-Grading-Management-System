import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router, private cdRef: ChangeDetectorRef) {}

  requestOtp() {
    if (!this.email) {
      alert("Vui lòng nhập email!");
      return;
    }

    this.isLoading = true;
    
    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.router.navigate(['/forgot-password/verify-otp'], { queryParams: { email: this.email } });
      },
      error: (err) => {
        alert(err.error?.message || 'Có lỗi xảy ra.');
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }
}
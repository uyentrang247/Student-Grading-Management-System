import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-otp.html',
  styleUrls: ['./verify-otp.css']
})
export class VerifyOtpComponent implements OnInit {
  email: string = '';
  otp: string = '';

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  nextStep() {
    if (!this.otp || this.otp.length !== 6) {
      alert("Vui lòng nhập chính xác mã OTP 6 số!");
      return;
    }

    this.authService.verifyOtp({ email: this.email, otp: this.otp }).subscribe({
      next: (response: any) => {
        this.router.navigate(['/forgot-password/reset-password'], { 
          queryParams: { email: this.email, otp: this.otp } 
        });
      },
      error: (error: any) => {
        alert(error.error?.message || "Mã OTP không chính xác hoặc đã hết hạn!");
      }
    });
  }
}
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private http: HttpClient, private router: Router) {}

  requestOtp() {
    if (!this.email) {
      alert("Vui lòng nhập email!");
      return;
    }

    this.isLoading = true;
    
    this.http.post('http://localhost:5059/api/auth/forgot-password', { email: this.email }).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.router.navigate(['/forgot-password/verify-otp'], { queryParams: { email: this.email } });
      },
      error: (err) => {
        alert(err.error?.message || 'Có lỗi xảy ra.');
        this.isLoading = false;
      }
    });
  }
}
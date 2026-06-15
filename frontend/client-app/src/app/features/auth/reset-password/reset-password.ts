import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.otp = params['otp'] || '';
    });
  }

  resetPassword() {
    if (!this.newPassword) {
      alert("Vui lòng nhập mật khẩu mới!");
      return;
    }

    this.isLoading = true;

    const payload = { 
      email: this.email, 
      otp: this.otp, 
      newPassword: this.newPassword 
    };

    this.http.post('http://localhost:5059/api/auth/reset-password', payload).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(err.error?.message || 'Đổi mật khẩu thất bại.');
        this.isLoading = false;
      }
    });
  }
}
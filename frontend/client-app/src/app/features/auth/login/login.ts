import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      UsernameOrEmail: ['', Validators.required],
      Password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.initGoogle();
  }

  initGoogle(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: '679144999056-4ap178auubdlvdj2a11a6kdrovoljueh.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleLogin(response),
        auto_select: false
      });
    }
  }

  loginWithGoogle(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.prompt();
    } else {
      this.errorMessage = 'Google Sign-In chưa được tải, vui lòng thử lại';
    }
  }

  handleGoogleLogin(response: any): void {
    const idToken = response.credential;
    this.authService.googleLogin(idToken).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Đăng nhập Google thất bại';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('userRole', res.role);
          localStorage.setItem('userId', res.userId?.toString() || '');
          
          try {
            const payload = res.token.split('.')[1];
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const decodedPayload = decodeURIComponent(
              window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join('')
            );
            
            const tokenData = JSON.parse(decodedPayload);
            
            const name = tokenData.FullName || 
                         tokenData.fullName || 
                         tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || 
                         tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
                         tokenData.unique_name;
                         
            if (name) {
              localStorage.setItem('fullName', name);
            }
          } catch (e) {
            console.error('Lỗi giải mã token', e);
          }
        }
        
        if (res && res.role) {
          localStorage.setItem('userRole', res.role);
        }
        
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Tên đăng nhập hoặc mật khẩu không đúng';
      }
    });
  }
}
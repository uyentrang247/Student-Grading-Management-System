import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      UsernameOrEmail: ['', Validators.required],
      Password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngAfterViewInit(): void {
    this.renderGoogleButton();
  }

  renderGoogleButton(): void {
    const checkInterval = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(checkInterval);
        
        const container = document.getElementById('google-btn-container');
        if (!container) return;

        // Xóa nội dung cũ
        container.innerHTML = '';

        // Khởi tạo Google Sign-In
        google.accounts.id.initialize({
          client_id: '679144999056-4ap178auubdlvdj2a11a6kdrovoljueh.apps.googleusercontent.com',
          callback: (response: any) => this.handleGoogleLogin(response),
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render button Google
        google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: '100%',
          locale: 'vi'
        });

        this.cdr.detectChanges();
      }
    }, 100);

    setTimeout(() => clearInterval(checkInterval), 5000);
  }

  handleGoogleLogin(response: any): void {
    const idToken = response.credential;
    
    this.authService.googleLogin(idToken).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Đăng nhập Google thất bại';
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      }
    });
  }
}
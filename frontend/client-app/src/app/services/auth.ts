import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5059/api/auth';

  constructor(private http: HttpClient) {}

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userRole', response.role);
          localStorage.setItem('userId', response.userId?.toString() || '');
          
          const name = response.fullName || response.name || response.hoTen || response.username;
          if (name) {
            localStorage.setItem('fullName', name);
          }
        }
      })
    );
  }

  googleLogin(idToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google-login`, { idToken }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userRole', response.role);
          localStorage.setItem('userId', response.userId?.toString() || '');
          if (response.fullName) {
            localStorage.setItem('fullName', response.fullName);
          }
        }
      })
    );
  }

  verifyOtp(model: { email: string; otp: string }) {
    return this.http.post(`${this.apiUrl}/verify-otp`, model);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return localStorage.getItem('userRole') === 'Admin';
  }

  isLecturer(): boolean {
    return localStorage.getItem('userRole') === 'Lecturer';
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserName(): string {
    return localStorage.getItem('fullName') || 'Người dùng';
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  }

  getRoleDisplayName(): string {
    const role = this.getUserRole();
    if (role === 'Admin') return 'Quản trị viên';
    if (role === 'Lecturer') return 'Giảng viên';
    return '';
  }
}
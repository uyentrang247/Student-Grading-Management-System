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
          
          const name = response.fullName || response.name || response.hoTen || response.username;
          if (name) {
            localStorage.setItem('fullName', name);
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

  getRoleDisplayName(): string {
    const role = this.getUserRole();
    if (role === 'Admin') return 'Quản trị viên';
    if (role === 'Lecturer') return 'Giảng viên';
    return '';
  }
}
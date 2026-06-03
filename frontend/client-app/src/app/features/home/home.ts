import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { SemesterService } from '../../services/semester';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  currentSemester: string = 'Đang tải...';
  currentAcademicYear: string = '';

  constructor(
    private authService: AuthService,
    private semesterService: SemesterService
  ) {}

  ngOnInit(): void {
    this.getCurrentSemester();
  }

  getUserName(): string {
    return this.authService.getUserName();
  }

  getRoleTitle(): string {
    if (this.isAdmin()) return 'Quản trị viên';
    if (this.isLecturer()) return 'Giảng viên';
    return 'Người dùng';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isLecturer(): boolean {
    return this.authService.isLecturer();
  }

  getCurrentSemester(): void {
    this.semesterService.getSemesters().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const current = data[0];
          this.currentSemester = current.term;
          this.currentAcademicYear = current.academicYear;
        } else {
          this.currentSemester = 'Chưa có';
        }
      },
      error: (err) => {
        console.error('Lỗi:', err);
        this.currentSemester = 'Lỗi tải';
      }
    });
  }
}
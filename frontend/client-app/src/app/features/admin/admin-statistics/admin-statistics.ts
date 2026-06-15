import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStatisticsService } from '../../../services/admin-statistics.service';
import { SystemStatistics } from '../../../models/admin-statistics.model';

@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-statistics.html',
  styleUrls: ['./admin-statistics.css']
})
export class AdminStatistics implements OnInit {
  stats: SystemStatistics | null = null;
  loading = false;
  error: string | null = null;

  constructor(private statisticsService: AdminStatisticsService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    this.statisticsService.getSystemStatistics().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        } else {
          this.error = response.message || 'Không thể tải dữ liệu thống kê';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải thống kê:', err);
        this.error = err.error?.message || 'Không thể tải dữ liệu thống kê';
        this.loading = false;
      }
    });
  }

  getPassRateColor(rate: number): string {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    if (rate >= 40) return '#fd7e14';
    return '#dc3545';
  }

  getScoreColor(score: number): string {
    if (score >= 8.0) return '#28a745';
    if (score >= 6.5) return '#17a2b8';
    if (score >= 5.0) return '#ffc107';
    if (score >= 4.0) return '#fd7e14';
    return '#dc3545';
  }

  getStudentTeacherRatio(students: number, teachers: number): number {
    if (teachers === 0) return 0;
    return Math.round(students / teachers);
  }

  getStudentTeacherRatioColor(students: number, teachers: number): string {
    const ratio = this.getStudentTeacherRatio(students, teachers);
    if (ratio <= 20) return '#28a745';
    if (ratio <= 35) return '#ffc107';
    return '#dc3545';
  }
}
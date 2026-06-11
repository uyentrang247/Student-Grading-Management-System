import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LecturerReportService } from '../../../services/lecturer-report.service';
import { LecturerDashboardData, ClassProgress } from '../../../models/lecturer-report.model';

@Component({
  selector: 'app-lecturer-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lecturer-report.html',
  styleUrls: ['./lecturer-report.css']
})
export class LecturerReport implements OnInit {
  dashboard: LecturerDashboardData | null = null;
  loading = true;
  error: string | null = null;

  private cacheKey = 'lecturer_dashboard_cache';

  constructor(private reportService: LecturerReportService) {}

  ngOnInit(): void {
    // Lấy dữ liệu từ cache trước (hiển thị ngay)
    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      try {
        this.dashboard = JSON.parse(cachedData);
        this.loading = false;
      } catch (e) {
        console.error('Lỗi đọc cache:', e);
      }
    }
    
    // Gọi API cập nhật dữ liệu mới (chạy ngầm)
    this.reportService.getDashboard().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboard = response.data;
          localStorage.setItem(this.cacheKey, JSON.stringify(response.data));
        } else if (!this.dashboard) {
          this.error = response.message || 'Không thể tải dữ liệu';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải dashboard:', err);
        if (!this.dashboard) {
          this.error = err.error?.message || 'Không thể tải dữ liệu';
        }
        this.loading = false;
      }
    });
  }

  getMaxClassPercentage(classCount: number): number {
    if (!this.dashboard?.teachingLoad.length) return 0;
    const maxCount = Math.max(...this.dashboard.teachingLoad.map(t => t.classCount));
    if (maxCount === 0) return 0;
    return (classCount / maxCount) * 100;
  }

  getProgressColor(percent: number): string {
    if (percent >= 100) return '#28a745';
    if (percent >= 70) return '#17a2b8';
    if (percent >= 40) return '#ffc107';
    return '#dc3545';
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'HOÀN THÀNH';
      case 'incomplete': return 'ĐANG LÀM';
      case 'not_started': return 'CHƯA BẮT ĐẦU';
      default: return 'CHƯA XÁC ĐỊNH';
    }
  }

  getIncompleteClasses(): ClassProgress[] {
    if (!this.dashboard?.classProgress) return [];
    return this.dashboard.classProgress.filter(c => c.status !== 'completed' && c.totalStudents > 0);
  }
}
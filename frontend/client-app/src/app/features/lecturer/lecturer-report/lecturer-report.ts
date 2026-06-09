import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LecturerReportService } from '../../../services/lecturer-report.service';
import { CourseClass, ClassReport } from '../../../models/lecturer-report.model';

@Component({
  selector: 'app-lecturer-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lecturer-report.html',
  styleUrls: ['./lecturer-report.css']
})
export class LecturerReport implements OnInit {
  myClasses: CourseClass[] = [];
  selectedClassId: number | null = null;
  report: ClassReport | null = null;
  loading = false;
  error: string | null = null;

  constructor(private reportService: LecturerReportService) {}

  ngOnInit(): void {
    this.loadMyClasses();
  }

  loadMyClasses(): void {
    this.loading = true;
    this.reportService.getMyClasses().subscribe({
      next: (response) => {
        if (response.success) {
          this.myClasses = response.data;
        } else {
          this.error = response.message || 'Không thể tải danh sách lớp';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải danh sách lớp:', err);
        this.error = 'Không thể tải danh sách lớp phụ trách';
        this.loading = false;
      }
    });
  }

  loadReport(): void {
    if (!this.selectedClassId) {
      this.report = null;
      return;
    }

    this.loading = true;
    this.error = null;

    this.reportService.getClassReport(this.selectedClassId).subscribe({
      next: (response) => {
        if (response.success) {
          this.report = response.data;
          // Gán chiều cao cho từng cột sau khi có dữ liệu
          this.updateBarHeights();
        } else {
          this.error = response.message || 'Không thể tải báo cáo';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải báo cáo:', err);
        this.error = err.error?.message || 'Không thể tải báo cáo';
        this.report = null;
        this.loading = false;
      }
    });
  }

  updateBarHeights(): void {
    if (!this.report) return;
    
    // Tìm tỷ lệ phần trăm lớn nhất để làm chuẩn
    const maxPercent = Math.max(...this.report.scoreRanges.map(r => r.percentage));
    const maxHeight = 180; // Chiều cao tối đa của cột (px)
    
    // Cập nhật chiều cao cho từng cột theo CSS
    setTimeout(() => {
      const bars = document.querySelectorAll('.bar');
      this.report?.scoreRanges.forEach((range, index) => {
        if (bars[index]) {
          const height = maxPercent > 0 ? (range.percentage / maxPercent) * maxHeight : 0;
          (bars[index] as HTMLElement).style.height = `${Math.max(height, 8)}px`;
        }
      });
    }, 0);
  }

  getBarHeight(percentage: number): number {
    const maxPercent = Math.max(...(this.report?.scoreRanges.map(r => r.percentage) || [50]));
    const maxHeight = 180;
    if (maxPercent === 0) return 8;
    return Math.max((percentage / maxPercent) * maxHeight, 8);
  }

  getBarPercentage(percentage: number): number {
    const maxPercent = Math.max(...(this.report?.scoreRanges.map(r => r.percentage) || [50]));
    if (maxPercent === 0) return 0;
    return (percentage / maxPercent) * 100;
  }
}
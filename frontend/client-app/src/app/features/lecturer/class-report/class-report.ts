import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, CourseClassSimple, ClassReport } from '../../../services/report.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-class-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-report.html',
  styleUrls: ['./class-report.css']
})
export class ClassReportComponent implements OnInit {
  courseClasses: CourseClassSimple[] = [];
  selectedClassId: number = 0;
  report: ClassReport | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  // Dữ liệu cho biểu đồ cột
  chartData = {
    labels: ['0-4', '4-5', '5-7', '7-9', '9-10'],
    values: [0, 0, 0, 0, 0],
    maxValue: 0
  };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadCourseClasses();
  }

  loadCourseClasses(): void {
    this.isLoading = true;
    this.reportService.getMyCourseClasses().subscribe({
      next: (data) => {
        this.courseClasses = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi tải danh sách lớp';
      }
    });
  }

  onClassChange(): void {
    if (!this.selectedClassId) {
      this.report = null;
      return;
    }

    this.isLoading = true;
    this.reportService.getClassReport(this.selectedClassId).subscribe({
      next: (data) => {
        this.report = data;
        this.updateChartData();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi tải báo cáo';
      }
    });
  }

  updateChartData(): void {
    if (this.report) {
      this.chartData.values = [
        this.report.scoreDistribution.range_0_4,
        this.report.scoreDistribution.range_4_5,
        this.report.scoreDistribution.range_5_7,
        this.report.scoreDistribution.range_7_9,
        this.report.scoreDistribution.range_9_10
      ];
      this.chartData.maxValue = Math.max(...this.chartData.values, 1);
    }
  }

  getBarHeight(value: number): string {
    if (this.chartData.maxValue === 0) return '0%';
    return `${(value / this.chartData.maxValue) * 100}%`;
  }

  exportToExcel(): void {
    if (!this.report) return;

    // Tạo dữ liệu cho Excel
    const summaryData = [
      ['BÁO CÁO THỐNG KÊ LỚP HỌC PHẦN'],
      ['Tên lớp', this.report.classCode],
      ['Môn học', this.report.subjectName],
      ['Giảng viên', this.report.lecturerName],
      ['Học kỳ', `${this.report.semester} - ${this.report.academicYear}`],
      [],
      ['THỐNG KÊ TỔNG QUAN'],
      ['Sĩ số', this.report.totalStudents],
      ['Số sinh viên đậu', this.report.passCount],
      ['Số sinh viên rớt', this.report.failCount],
      ['Tỷ lệ đậu', `${this.report.passRate}%`],
      ['Tỷ lệ rớt', `${this.report.failRate}%`],
      ['Điểm trung bình', this.report.averageScore],
      ['Điểm cao nhất', this.report.highestScore],
      ['Điểm thấp nhất', this.report.lowestScore],
      [],
      ['PHÂN BỐ ĐIỂM THEO THANG ĐIỂM CHỮ'],
      ['Xếp loại', 'Khoảng điểm', 'Số lượng', 'Tỷ lệ'],
      ['A', this.report.gradeLetterDistribution.a.range, this.report.gradeLetterDistribution.a.count, `${this.report.gradeLetterDistribution.a.percentage}%`],
      ['B', this.report.gradeLetterDistribution.b.range, this.report.gradeLetterDistribution.b.count, `${this.report.gradeLetterDistribution.b.percentage}%`],
      ['C', this.report.gradeLetterDistribution.c.range, this.report.gradeLetterDistribution.c.count, `${this.report.gradeLetterDistribution.c.percentage}%`],
      ['D', this.report.gradeLetterDistribution.d.range, this.report.gradeLetterDistribution.d.count, `${this.report.gradeLetterDistribution.d.percentage}%`],
      ['F', this.report.gradeLetterDistribution.f.range, this.report.gradeLetterDistribution.f.count, `${this.report.gradeLetterDistribution.f.percentage}%`]
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BaoCaoLop');
    XLSX.writeFile(wb, `BaoCao_${this.report.classCode}.xlsx`);
  }
}
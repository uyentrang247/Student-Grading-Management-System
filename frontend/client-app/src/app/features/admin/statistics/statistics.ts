import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, AdminStatistics } from '../../../services/report.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.css']
})
export class StatisticsComponent implements OnInit {
  statistics: AdminStatistics | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  chartData = {
    labels: ['0-4', '4-5', '5-7', '7-9', '9-10'],
    values: [0, 0, 0, 0, 0],
    maxValue: 0
  };

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();  // Force update UI
    
    this.reportService.getAdminStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
        this.updateChartData();
        this.isLoading = false;
        this.cdr.detectChanges();  // Force update UI sau khi có data
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi tải dữ liệu thống kê';
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  updateChartData(): void {
    if (this.statistics) {
      this.chartData.values = [
        this.statistics.overallScoreDistribution.range_0_4,
        this.statistics.overallScoreDistribution.range_4_5,
        this.statistics.overallScoreDistribution.range_5_7,
        this.statistics.overallScoreDistribution.range_7_9,
        this.statistics.overallScoreDistribution.range_9_10
      ];
      this.chartData.maxValue = Math.max(...this.chartData.values, 1);
    }
  }

  getBarHeight(value: number): string {
    if (this.chartData.maxValue === 0) return '0%';
    return `${(value / this.chartData.maxValue) * 100}%`;
  }

  exportToExcel(): void {
    if (!this.statistics) return;

    const excelData: any[][] = [];

    excelData.push(['BÁO CÁO THỐNG KÊ TỔNG HỢP HỆ THỐNG']);
    excelData.push([`Ngày xuất: ${new Date().toLocaleString('vi-VN')}`]);
    excelData.push([]);
    excelData.push(['THỐNG KÊ TỔNG QUAN']);
    excelData.push(['Tổng số sinh viên', this.statistics.overview.totalStudents]);
    excelData.push(['Tổng số giảng viên', this.statistics.overview.totalLecturers]);
    excelData.push(['Tổng số môn học', this.statistics.overview.totalSubjects]);
    excelData.push(['Tổng số lớp học phần', this.statistics.overview.totalCourseClasses]);
    excelData.push(['Tổng số lượt ghi danh', this.statistics.overview.totalEnrollments]);
    excelData.push(['Tỷ lệ đậu toàn trường', `${this.statistics.overview.overallPassRate}%`]);
    excelData.push(['Điểm trung bình toàn trường', this.statistics.overview.averageScoreAll]);
    excelData.push([]);

    excelData.push(['THỐNG KÊ THEO KHOA']);
    excelData.push(['Tên khoa', 'Số SV', 'Số GV', 'Số lớp HP', 'Tỷ lệ đậu', 'Điểm TB']);
    this.statistics.facultyStatistics.forEach(f => {
      excelData.push([f.facultyName, f.studentCount, f.lecturerCount, f.courseClassCount, `${f.passRate}%`, f.averageScore]);
    });
    excelData.push([]);

    excelData.push(['TOP MÔN HỌC CÓ TỶ LỆ RỚT CAO NHẤT']);
    excelData.push(['Mã môn', 'Tên môn học', 'TC', 'Số SV', 'Số đậu', 'Số rớt', 'Tỷ lệ đậu', 'Tỷ lệ rớt', 'Điểm TB']);
    this.statistics.topFailSubjects.forEach(s => {
      excelData.push([s.subjectCode, s.subjectName, s.credits, s.totalStudents, s.passCount, s.failCount, `${s.passRate}%`, `${s.failRate}%`, s.averageScore]);
    });
    excelData.push([]);

    excelData.push(['THỐNG KÊ THEO HỌC KỲ']);
    excelData.push(['Học kỳ', 'Năm học', 'Số lớp HP', 'Số SV', 'Tỷ lệ đậu', 'Điểm TB']);
    this.statistics.semesterStatistics.forEach(s => {
      excelData.push([s.term, s.academicYear, s.courseClassCount, s.totalStudents, `${s.passRate}%`, s.averageScore]);
    });

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ThongKeHeThong');
    XLSX.writeFile(wb, `ThongKe_HeThong_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}
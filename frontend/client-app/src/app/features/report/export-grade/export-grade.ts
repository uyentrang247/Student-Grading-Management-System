import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report';
import { GradeEntryService, CourseClassForGrade } from '../../../services/grade-entry';

interface ClassReportData {
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  failRate: number;
  distribution: {
    excellent: number;
    good: number;
    average: number;
    weak: number;
    fail: number;
  };
}

@Component({
  selector: 'app-export-grade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './export-grade.html',
  styleUrls: ['./export-grade.css']
})
export class ExportGradeComponent implements OnInit {
  courseClasses: CourseClassForGrade[] = [];
  selectedClassId: number = 0;
  isLoading: boolean = false;
  reportData: ClassReportData | null = null;
  students: any[] = [];
  showReport: boolean = false;

  constructor(
    private reportService: ReportService,
    private gradeEntryService: GradeEntryService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadCourseClasses();
  }

  loadCourseClasses(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.gradeEntryService.getMyCourseClasses().subscribe({
      next: (data: CourseClassForGrade[]) => {
        this.ngZone.run(() => {
          this.courseClasses = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          alert('Lỗi tải danh sách lớp');
        });
      }
    });
  }

  onClassChange(): void {
    if (!this.selectedClassId) {
      this.reportData = null;
      this.showReport = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.showReport = false;
    this.cdr.detectChanges();

    this.gradeEntryService.getStudentsByClass(this.selectedClassId).subscribe({
      next: (data: any[]) => {
        this.ngZone.run(() => {
          this.students = data;
          this.reportData = this.calculateReport(data);
          this.showReport = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('API Error:', err);
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          alert('Lỗi tải dữ liệu: ' + (err.error?.message || 'Vui lòng thử lại'));
        });
      }
    });
  }

  calculateReport(students: any[]): ClassReportData {
    const scores: number[] = [];
    
    students.forEach(s => {
      if (s.processScore !== null && s.finalScore !== null) {
        const avg = Math.round((s.processScore * 0.4 + s.finalScore * 0.6) * 10) / 10;
        scores.push(avg);
      }
    });

    const total = scores.length;
    const excellent = scores.filter(s => s >= 8.5).length;
    const good = scores.filter(s => s >= 7.0 && s < 8.5).length;
    const average = scores.filter(s => s >= 5.5 && s < 7.0).length;
    const weak = scores.filter(s => s >= 4.0 && s < 5.5).length;
    const fail = scores.filter(s => s < 4.0).length;
    const passCount = scores.filter(s => s >= 4.0).length;

    return {
      totalStudents: students.length,
      averageScore: total > 0 ? Math.round(scores.reduce((a,b) => a + b, 0) / total * 10) / 10 : 0,
      highestScore: total > 0 ? Math.max(...scores) : 0,
      lowestScore: total > 0 ? Math.min(...scores) : 0,
      passRate: total > 0 ? Math.round(passCount / total * 100) : 0,
      failRate: total > 0 ? Math.round(fail / total * 100) : 0,
      distribution: { excellent, good, average, weak, fail }
    };
  }

  exportGradeExcel(): void {
    if (!this.selectedClassId) return;
    this.reportService.exportGradeExcel(this.selectedClassId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BangDiem_${this.selectedClassId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Lỗi xuất file')
    });
  }

  exportFailExcel(): void {
    if (!this.selectedClassId) return;
    this.reportService.exportFailExcel(this.selectedClassId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DanhSachHocLai_${this.selectedClassId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Lỗi xuất file')
    });
  }
}
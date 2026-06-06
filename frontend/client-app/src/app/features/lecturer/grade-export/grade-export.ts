import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GradeEntryService, TranscriptResponse } from '../../../services/grade-entry';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-grade-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grade-export.html',
  styleUrls: ['./grade-export.css']
})
export class GradeExportComponent implements OnInit {
  courseClasses: any[] = [];
  selectedClassId: number = 0;
  transcript: TranscriptResponse | null = null;
  isLoading: boolean = false;

  constructor(private gradeEntryService: GradeEntryService) {}

  ngOnInit(): void {
    this.loadCourseClasses();
  }

  loadCourseClasses(): void {
    this.isLoading = true;
    this.gradeEntryService.getMyCourseClasses().subscribe({
      next: (data) => {
        this.courseClasses = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Lỗi tải danh sách lớp');
      }
    });
  }

  onClassChange(): void {
    if (!this.selectedClassId) {
      this.transcript = null;
      return;
    }

    this.isLoading = true;
    this.gradeEntryService.getTranscript(this.selectedClassId).subscribe({
      next: (data) => {
        this.transcript = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Lỗi tải bảng điểm');
      }
    });
  }

  // ========== THÊM METHOD NÀY ĐỂ FIX LỖI ==========
  getGradeClass(gradeLetter: string): string {
    const letter = gradeLetter.toUpperCase();
    if (letter === 'A+' || letter === 'A') return 'A';
    if (letter === 'B+' || letter === 'B') return 'B';
    if (letter === 'C') return 'C';
    if (letter === 'D') return 'D';
    if (letter === 'F') return 'F';
    return 'default';
  }
  // ===============================================

  exportToExcel(): void {
    if (!this.transcript) return;

    // Tạo dữ liệu Excel
    const excelData = [
      ['BẢNG ĐIỂM LỚP HỌC PHẦN'],
      [`Lớp: ${this.transcript.courseClass.classCode}`],
      [`Môn học: ${this.transcript.courseClass.subjectName} (${this.transcript.courseClass.subjectCode})`],
      [`Số tín chỉ: ${this.transcript.courseClass.credits}`],
      [`Giảng viên: ${this.transcript.courseClass.lecturerName}`],
      [`Học kỳ: ${this.transcript.courseClass.semester} - ${this.transcript.courseClass.academicYear}`],
      [],
      ['STT', 'Mã sinh viên', 'Họ và tên', 'Điểm quá trình', 'Điểm cuối kỳ', 'Điểm TB', 'Điểm chữ', 'Thang điểm 4'],
      ...this.transcript.students.map((s, index) => [
        index + 1,
        s.studentCode,
        s.fullName,
        s.processScore ?? 'Chưa có',
        s.finalScore ?? 'Chưa có',
        s.averageScore ?? 'Chưa có',
        s.gradeLetter,
        s.gradeScale4 ?? 'Chưa có'
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BangDiem');
    XLSX.writeFile(wb, `BangDiem_${this.transcript.courseClass.classCode}.xlsx`);
  }
}
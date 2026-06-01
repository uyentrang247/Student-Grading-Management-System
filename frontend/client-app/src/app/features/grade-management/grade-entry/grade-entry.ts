import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GradeEntryService, CourseClassForGrade, StudentGrade, SaveGradeDto } from '../../../services/grade-entry';

@Component({
  selector: 'app-grade-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './grade-entry.html',
  styleUrls: ['./grade-entry.css']
})
export class GradeEntryComponent implements OnInit {
  courseClasses: CourseClassForGrade[] = [];
  selectedClassId: number = 0;
  students: StudentGrade[] = [];
  filteredStudents: StudentGrade[] = [];
  
  isLoading = false;
  searchKeyword = '';
  isSaving = false;
  showFailOnly = false;
  
  notification = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  private readonly lecturerId = 1;

  constructor(private gradeEntryService: GradeEntryService) {}

  ngOnInit(): void {
    this.loadCourseClasses();
  }

  loadCourseClasses(): void {
    this.isLoading = true;
    this.gradeEntryService.getCourseClassesByLecturer(this.lecturerId).subscribe({
      next: (data) => {
        this.courseClasses = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải lớp học phần:', err);
        this.showNotification('Không thể tải danh sách lớp học phần', 'error');
        this.isLoading = false;
      }
    });
  }

  onClassChange(): void {
    if (!this.selectedClassId) {
      this.students = [];
      this.filteredStudents = [];
      this.showFailOnly = false;
      return;
    }
    
    this.isLoading = true;
    this.showFailOnly = false;
    this.searchKeyword = '';
    
    this.gradeEntryService.getStudentsByClass(this.selectedClassId).subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải danh sách sinh viên:', err);
        this.showNotification('Không thể tải danh sách sinh viên', 'error');
        this.isLoading = false;
      }
    });
  }

  filterStudents(): void {
    const keyword = this.searchKeyword.trim().toLowerCase();
    
    let filtered = [...this.students];
    
    if (keyword) {
      filtered = filtered.filter(student =>
        student.studentCode.toLowerCase().includes(keyword) ||
        student.fullName.toLowerCase().includes(keyword)
      );
    }
    
    if (this.showFailOnly) {
      filtered = filtered.filter(student => {
        const avg = this.calculateAverage(student.processScore, student.finalScore);
        return avg !== null && avg < 4.0;
      });
    }
    
    this.filteredStudents = filtered;
  }

  toggleFailFilter(): void {
    this.showFailOnly = !this.showFailOnly;
    this.filterStudents();
    
    if (this.showFailOnly) {
      this.showNotification('Đang hiển thị danh sách sinh viên học lại (điểm F)', 'success');
    }
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.showFailOnly = false;
    this.filteredStudents = [...this.students];
  }

  validateScores(): boolean {
    for (const student of this.filteredStudents) {
      if (student.processScore === null || student.finalScore === null) {
        this.showNotification(`Sinh viên ${student.studentCode} chưa nhập đủ điểm`, 'error');
        return false;
      }
      
      if (student.processScore < 0 || student.processScore > 10) {
        this.showNotification(`Điểm quá trình của ${student.studentCode} không hợp lệ (0-10)`, 'error');
        return false;
      }
      
      if (student.finalScore < 0 || student.finalScore > 10) {
        this.showNotification(`Điểm cuối kỳ của ${student.studentCode} không hợp lệ (0-10)`, 'error');
        return false;
      }
    }
    return true;
  }

  roundScores(): void {
    for (const student of this.filteredStudents) {
      if (student.processScore !== null) {
        student.processScore = Math.round(student.processScore * 10) / 10;
      }
      if (student.finalScore !== null) {
        student.finalScore = Math.round(student.finalScore * 10) / 10;
      }
    }
  }

  saveGrades(): void {
    if (!this.validateScores()) {
      return;
    }
    
    this.roundScores();
    this.isSaving = true;
    
    const gradeData: SaveGradeDto[] = this.filteredStudents.map(student => ({
      enrollmentId: student.enrollmentId,
      courseClassId: student.courseClassId,
      processScore: student.processScore,
      finalScore: student.finalScore
    }));
    
    this.gradeEntryService.saveGradesBulk(gradeData).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.showNotification(response.message || 'Lưu điểm thành công!', 'success');
        this.onClassChange();
      },
      error: (err) => {
        console.error('Lỗi lưu điểm:', err);
        this.isSaving = false;
        this.showNotification(err.error?.message || 'Lưu điểm thất bại', 'error');
      }
    });
  }

  calculateAverage(process: number | null, final: number | null): number | null {
    if (process !== null && final !== null) {
      const average = process * 0.4 + final * 0.6;
      return Math.round(average * 10) / 10;
    }
    return null;
  }

  getGradeLetter(score: number | null): string {
    if (score === null) return 'Chưa có';
    if (score >= 9.0) return 'A+';
    if (score >= 8.0) return 'A';
    if (score >= 7.0) return 'B+';
    if (score >= 6.0) return 'B';
    if (score >= 5.0) return 'C';
    if (score >= 4.0) return 'D';
    return 'F';
  }

  getGradeScale4(score: number | null): number | null {
    if (score === null) return null;
    if (score >= 9.0) return 4.0;
    if (score >= 8.0) return 3.5;
    if (score >= 7.0) return 3.0;
    if (score >= 6.0) return 2.5;
    if (score >= 5.0) return 2.0;
    if (score >= 4.0) return 1.5;
    return 0.0;
  }

  getScoreClass(score: number | null): string {
    if (score === null) return 'bg-secondary';
    if (score >= 9.0) return 'bg-success';
    if (score >= 8.0) return 'bg-success';
    if (score >= 7.0) return 'bg-primary';
    if (score >= 6.0) return 'bg-info';
    if (score >= 5.0) return 'bg-info';
    if (score >= 4.0) return 'bg-warning';
    return 'bg-danger';
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { show: true, message, type };
    setTimeout(() => { this.notification.show = false; }, 3000);
  }

  closeNotification(): void {
    this.notification.show = false;
  }

  getSelectedClassName(): string {
    const selected = this.courseClasses.find(c => c.courseClassId === this.selectedClassId);
    return selected ? `${selected.classCode} - ${selected.subjectName}` : '';
  }
}
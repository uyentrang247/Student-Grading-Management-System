import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  displayedStudents: StudentGrade[] = [];
  
  isLoading = false;
  searchKeyword = '';
  isSaving = false;
  showFailOnly = false;
  
  // Phân trang
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  
  // Popup sửa điểm
  showEditPopup: boolean = false;
  editingStudent: StudentGrade | null = null;
  editProcessScore: number | null = null;
  editFinalScore: number | null = null;
  
  notification = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  private readonly lecturerId = 2;

  constructor(
    private gradeEntryService: GradeEntryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourseClasses();
  }

  loadCourseClasses(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.gradeEntryService.getCourseClassesByLecturer(this.lecturerId).subscribe({
      next: (data) => {
        this.courseClasses = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải lớp học phần:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        if (err.status === 0) {
          this.showNotification('Không thể kết nối đến máy chủ!', 'error');
        }
      }
    });
  }

  onClassChange(): void {
    if (!this.selectedClassId) {
      this.students = [];
      this.displayedStudents = [];
      this.currentPage = 1;
      this.cdr.detectChanges();
      return;
    }
    
    this.isLoading = true;
    this.showFailOnly = false;
    this.searchKeyword = '';
    this.currentPage = 1;
    this.cdr.detectChanges();
    
    this.gradeEntryService.getStudentsByClass(this.selectedClassId).subscribe({
      next: (data) => {
        this.students = data;
        this.applyFiltersAndPagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải danh sách sinh viên:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        if (err.status === 0) {
          this.showNotification('Không thể kết nối đến máy chủ', 'error');
        }
      }
    });
  }

  applyFiltersAndPagination(): void {
    let filtered = [...this.students];
    
    // Tìm kiếm
    const keyword = this.searchKeyword.trim().toLowerCase();
    if (keyword) {
      filtered = filtered.filter(student =>
        student.studentCode.toLowerCase().includes(keyword) ||
        student.fullName.toLowerCase().includes(keyword)
      );
    }
    
    // Lọc học lại
    if (this.showFailOnly) {
      filtered = filtered.filter(student => {
        const avg = this.calculateAverage(student.processScore, student.finalScore);
        return avg !== null && avg < 4.0;
      });
    }
    
    // Phân trang
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedStudents = filtered.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  filterStudents(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  toggleFailFilter(): void {
    this.showFailOnly = !this.showFailOnly;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
    
    if (this.showFailOnly && this.displayedStudents.length === 0) {
      this.showNotification('Không có sinh viên học lại (điểm F)', 'error');
    }
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.showFailOnly = false;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndPagination();
    }
  }

  // Mở popup sửa điểm
  openEditPopup(student: StudentGrade): void {
    this.editingStudent = student;
    this.editProcessScore = student.processScore;
    this.editFinalScore = student.finalScore;
    this.showEditPopup = true;
    this.cdr.detectChanges();
  }

  closeEditPopup(): void {
    this.showEditPopup = false;
    this.editingStudent = null;
    this.editProcessScore = null;
    this.editFinalScore = null;
    this.cdr.detectChanges();
  }

  saveSingleGrade(): void {
    if (!this.editingStudent) return;
    
    if (this.editProcessScore === null || this.editFinalScore === null) {
      this.showNotification('Vui lòng nhập đủ điểm!', 'error');
      return;
    }
    
    if (this.editProcessScore < 0 || this.editProcessScore > 10) {
      this.showNotification('Điểm quá trình không hợp lệ (0-10)', 'error');
      return;
    }
    
    if (this.editFinalScore < 0 || this.editFinalScore > 10) {
      this.showNotification('Điểm cuối kỳ không hợp lệ (0-10)', 'error');
      return;
    }
    
    this.isSaving = true;
    this.cdr.detectChanges();
    
    const gradeData: SaveGradeDto[] = [{
      enrollmentId: this.editingStudent.enrollmentId,
      courseClassId: this.editingStudent.courseClassId,
      processScore: Math.round(this.editProcessScore * 10) / 10,
      finalScore: Math.round(this.editFinalScore * 10) / 10
    }];
    
    this.gradeEntryService.saveGradesBulk(gradeData).subscribe({
      next: (response) => {
        this.isSaving = false;
        // Cập nhật lại dữ liệu trong mảng students
        const index = this.students.findIndex(s => s.enrollmentId === this.editingStudent!.enrollmentId);
        if (index !== -1) {
          this.students[index].processScore = gradeData[0].processScore;
          this.students[index].finalScore = gradeData[0].finalScore;
        }
        this.applyFiltersAndPagination();
        this.showNotification('Lưu điểm thành công!', 'success');
        this.closeEditPopup();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi lưu điểm:', err);
        this.isSaving = false;
        this.showNotification(err.error?.message || 'Lưu điểm thất bại', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  hasNoScore(student: StudentGrade): boolean {
    return student.processScore === null && student.finalScore === null;
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

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { show: true, message, type };
    this.cdr.detectChanges();
    setTimeout(() => { 
      this.notification.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  closeNotification(): void {
    this.notification.show = false;
    this.cdr.detectChanges();
  }

  getSelectedClassName(): string {
    const selected = this.courseClasses.find(c => c.courseClassId === this.selectedClassId);
    return selected ? `${selected.classCode} - ${selected.subjectName}` : '';
  }

  getTotalCount(): number {
    let filtered = [...this.students];
    const keyword = this.searchKeyword.trim().toLowerCase();
    if (keyword) {
      filtered = filtered.filter(s => s.studentCode.toLowerCase().includes(keyword) || s.fullName.toLowerCase().includes(keyword));
    }
    if (this.showFailOnly) {
      filtered = filtered.filter(s => {
        const avg = this.calculateAverage(s.processScore, s.finalScore);
        return avg !== null && avg < 4.0;
      });
    }
    return filtered.length;
  }
}
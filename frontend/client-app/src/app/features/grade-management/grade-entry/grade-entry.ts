import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GradeEntryService, CourseClassForGrade } from '../../../services/grade-entry';
import { StudentGrade } from '../../../models/student-grade';
import { GradeListComponent } from '../grade-list/grade-list';
import { GradeFilterComponent } from '../grade-filter/grade-filter';
import { GradePaginationComponent } from '../grade-pagination/grade-pagination';
import { GradeEditModalComponent } from '../grade-edit-modal/grade-edit-modal';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-grade-entry',
  standalone: true,
  imports: [
    CommonModule,
    GradeListComponent,
    GradeFilterComponent,
    GradePaginationComponent,
    GradeEditModalComponent
  ],
  templateUrl: './grade-entry.html',
  styleUrls: ['./grade-entry.css']
})
export class GradeEntryComponent implements OnInit {
  courseClasses: CourseClassForGrade[] = [];
  selectedClassId: number = 0;
  students: StudentGrade[] = [];
  filteredStudents: StudentGrade[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  showEditPopup: boolean = false;
  selectedStudent: StudentGrade | null = null;
  isLoading: boolean = false;
  searchKeyword: string = '';
  showFailOnly: boolean = false;
  notification = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(
    private gradeEntryService: GradeEntryService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourseClasses();
  }

  loadCourseClasses(): void {
    this.isLoading = true;
    this.gradeEntryService.getMyCourseClasses().subscribe({
      next: (data: CourseClassForGrade[]) => {
        this.courseClasses = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.showNotification('Lỗi tải danh sách lớp', 'error');
      }
    });
  }

  onClassChange(classId: number): void {
    this.selectedClassId = classId;
    if (!classId) return;
    this.isLoading = true;
    this.searchKeyword = '';
    this.showFailOnly = false;
    
    this.gradeEntryService.getStudentsByClass(classId).subscribe({
      next: (data: StudentGrade[]) => {
        this.students = data;
        this.filteredStudents = data;
        this.updatePagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.showNotification('Lỗi tải danh sách sinh viên', 'error');
      }
    });
  }

  onFilterChange(event: { filtered: StudentGrade[], keyword: string, failOnly: boolean }): void {
    this.filteredStudents = event.filtered;
    this.searchKeyword = event.keyword;
    this.showFailOnly = event.failOnly;
    this.updatePagination();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onEditStudent(student: StudentGrade): void {
    this.selectedStudent = student;
    this.showEditPopup = true;
  }

  closeEditPopup(): void {
    this.showEditPopup = false;
    this.selectedStudent = null;
  }

  onSaveSuccess(updatedStudent: StudentGrade): void {
    const index = this.students.findIndex(s => s.enrollmentId === updatedStudent.enrollmentId);
    if (index !== -1) {
      this.students[index] = { ...this.students[index], ...updatedStudent };
      this.applyCurrentFilters();
    }
    this.closeEditPopup();
    this.showNotification('Lưu điểm thành công!', 'success');
  }

  applyCurrentFilters(): void {
    let filtered = [...this.students];
    const keyword = this.searchKeyword.trim().toLowerCase();
    if (keyword) {
      filtered = filtered.filter(s =>
        s.studentCode.toLowerCase().includes(keyword) ||
        s.fullName.toLowerCase().includes(keyword)
      );
    }
    if (this.showFailOnly) {
      filtered = filtered.filter(s => {
        const avg = s.processScore !== null && s.finalScore !== null
          ? Math.round((s.processScore * 0.4 + s.finalScore * 0.6) * 10) / 10
          : null;
        return avg !== null && avg < 4.0;
      });
    }
    this.filteredStudents = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStudents.length / this.pageSize);
    this.currentPage = 1;
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
  }

  getTotalCount(): number {
    return this.filteredStudents.length;
  }

  loadFailStudents(): void {
    if (!this.selectedClassId) {
      this.showNotification('Vui lòng chọn lớp học phần', 'error');
      return;
    }
    this.isLoading = true;
    this.gradeEntryService.getFailStudents(this.selectedClassId).subscribe({
      next: (data: any[]) => {
        this.filteredStudents = data;
        this.updatePagination();
        this.isLoading = false;
        this.showNotification(`Có ${data.length} sinh viên rớt`, 'success');
      },
      error: () => {
        this.isLoading = false;
        this.showNotification('Lỗi tải danh sách sinh viên rớt', 'error');
      }
    });
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GradeEntryService, CourseClassForGrade } from '../../../services/grade-entry';
import { GradeListComponent } from '../grade-list/grade-list';
import { GradeFilterComponent } from '../grade-filter/grade-filter';
import { GradePaginationComponent } from '../grade-pagination/grade-pagination';
import { GradeEditModalComponent } from '../grade-edit-modal/grade-edit-modal';

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
  
  students: any[] = [];
  filteredStudents: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  
  showEditPopup: boolean = false;
  selectedStudent: any = null;

  isLoading: boolean = false;
  searchKeyword: string = '';
  showFailOnly: boolean = false;
  
  notification = { show: false, message: '', type: 'success' as 'success' | 'error' };

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
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onClassChange(classId: number): void {
    this.selectedClassId = classId;
    if (!this.selectedClassId) return;
    
    this.isLoading = true;
    this.searchKeyword = '';
    this.showFailOnly = false;
    this.cdr.detectChanges();
    
    this.gradeEntryService.getStudentsByClass(this.selectedClassId).subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = data;
        this.updatePagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange(event: { filtered: any[], keyword: string, showFailOnly: boolean }): void {
    this.filteredStudents = event.filtered;
    this.searchKeyword = event.keyword;
    this.showFailOnly = event.showFailOnly;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  onResetFilter(): void {
    this.filteredStudents = this.students;
    this.searchKeyword = '';
    this.showFailOnly = false;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  onEditStudent(student: any): void {
    this.selectedStudent = student;
    this.showEditPopup = true;
    this.cdr.detectChanges();
  }

  closeEditPopup(): void {
    this.showEditPopup = false;
    this.selectedStudent = null;
    this.cdr.detectChanges();
  }

  onSaveSuccess(updatedStudent: any): void {
    const index = this.students.findIndex(s => s.enrollmentId === updatedStudent.enrollmentId);
    if (index !== -1) {
      this.students[index] = { ...this.students[index], ...updatedStudent };
      this.applyCurrentFilters();
    }
    this.closeEditPopup();
    this.showNotification('Lưu điểm thành công!', 'success');
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStudents.length / this.pageSize);
    this.currentPage = 1;
    this.cdr.detectChanges();
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

  getTotalCount(): number {
    return this.filteredStudents.length;
  }
}
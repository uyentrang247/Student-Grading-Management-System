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

  constructor(
    private gradeEntryService: GradeEntryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourseClasses();
  }

  // Hàm giải mã token lấy userId
  private getUserIdFromToken(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = decodeURIComponent(
        window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      const tokenData = JSON.parse(decodedPayload);
      
      // Lấy userId từ các trường có thể có
      const userId = tokenData.sub || tokenData.nameid || tokenData.UserId || tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      return userId ? parseInt(userId) : null;
    } catch (e) {
      console.error('Lỗi giải mã token:', e);
      return null;
    }
  }

  loadCourseClasses(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    const lecturerId = this.getUserIdFromToken();
    
    if (!lecturerId) {
      console.error('Không tìm thấy lecturerId từ token');
      this.isLoading = false;
      this.showNotification('Không tìm thấy thông tin giảng viên', 'error');
      return;
    }
    
    console.log('LecturerId từ token:', lecturerId);
    
    this.gradeEntryService.getCourseClassesByLecturer(lecturerId).subscribe({
      next: (data) => {
        this.courseClasses = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.showNotification('Lỗi tải danh sách lớp', 'error');
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
        this.showNotification('Lỗi tải danh sách sinh viên', 'error');
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

  loadFailStudents(): void {
    if (!this.selectedClassId) {
      this.showNotification('Vui lòng chọn lớp học phần', 'error');
      return;
    }
    
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.gradeEntryService.getFailStudents(this.selectedClassId).subscribe({
      next: (data) => {
        this.filteredStudents = data;
        this.updatePagination();
        this.isLoading = false;
        this.showNotification(`Có ${data.length} sinh viên rớt`, 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.showNotification('Lỗi tải danh sách sinh viên rớt', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  viewTranscript(): void {
    if (!this.selectedClassId) {
      this.showNotification('Vui lòng chọn lớp học phần', 'error');
      return;
    }
    
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.gradeEntryService.getTranscript(this.selectedClassId).subscribe({
      next: (data) => {
        this.filteredStudents = data.students;
        this.updatePagination();
        this.isLoading = false;
        this.showNotification(`Đã tải bảng điểm lớp ${data.courseClass.classCode}`, 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.showNotification('Lỗi tải bảng điểm', 'error');
        this.cdr.detectChanges();
      }
    });
  }
}
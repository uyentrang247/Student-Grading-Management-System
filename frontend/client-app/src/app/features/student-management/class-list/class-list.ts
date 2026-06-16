import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Thêm ChangeDetectorRef ở đây
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { EnrollmentService } from '../../../services/enrollment';
import { CourseClass } from '../../../models/enrollment';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './class-list.html',
  styleUrl: './class-list.css'
})
export class ClassListComponent implements OnInit {
  classes: CourseClass[] = [];
  semesters: any[] = [];
  selectedSemesterId: number = 0;

  constructor(
    private enrollmentService: EnrollmentService,
    private router: Router,
    private cdr: ChangeDetectorRef // 2. Inject ChangeDetectorRef vào constructor
  ) {}

  ngOnInit(): void {
    this.loadSemesters();
    this.loadClasses();
  }

  loadSemesters(): void {
    this.enrollmentService.getSemesters().subscribe({
      next: (data) => {
        this.semesters = data;
        this.cdr.detectChanges(); // 3. Ép cập nhật Dropdown học kỳ lập tức
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách học kỳ:', err);
      }
    });
  }

  loadClasses(): void {
    const semesterParam = this.selectedSemesterId || undefined;
    
    this.enrollmentService.getClasses(semesterParam).subscribe({
      next: (data) => {
        this.classes = data;
        this.cdr.detectChanges(); // 4. Ép bảng danh sách lớp hiển thị ra UI ngay lập tức không delay
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách lớp học phần:', err);
      }
    });
  }

  onSemesterChange(): void {
    this.loadClasses();
  }

  viewClassDetail(classId: number): void {
    this.router.navigate(['/lecturer/classes', classId]);
  }
}
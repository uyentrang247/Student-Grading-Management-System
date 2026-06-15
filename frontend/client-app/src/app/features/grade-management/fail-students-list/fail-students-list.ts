import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GradeEntryService, CourseClassForGrade } from '../../../services/grade-entry';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-fail-students-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fail-students-list.html',
  styleUrls: ['./fail-students-list.css']
})
export class FailStudentsListComponent implements OnInit {
  courseClasses: CourseClassForGrade[] = [];
  selectedClassId: number = 0;
  failStudents: any[] = [];
  isLoading: boolean = false;
  selectedClassName: string = '';

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
    this.cdr.detectChanges();
    
    this.gradeEntryService.getMyCourseClasses().subscribe({
      next: (data: CourseClassForGrade[]) => {
        this.courseClasses = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        alert('Lỗi tải danh sách lớp');
      }
    });
  }

  onClassChange(): void {
    if (!this.selectedClassId) {
      this.failStudents = [];
      return;
    }
    
    const selectedClass = this.courseClasses.find(c => c.courseClassId === this.selectedClassId);
    this.selectedClassName = selectedClass ? `${selectedClass.classCode} - ${selectedClass.subjectName}` : '';
    
    this.isLoading = true;
    this.cdr.detectChanges();
    this.gradeEntryService.getFailStudents(this.selectedClassId).subscribe({
      next: (data: any[]) => {
        this.failStudents = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        alert('Lỗi tải danh sách sinh viên học lại');
      }
    });
  }
}
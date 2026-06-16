import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { CourseClass } from '../../../models/course-class';
import { CourseClassService } from '../../../services/course-class';
import { SubjectService } from '../../../services/subject';

@Component({
  selector: 'app-course-class-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './course-class-form.html',
  styleUrls: ['./course-class-form.css']
})
export class CourseClassForm implements OnInit {

  isEditMode = false;

  subjects: any[] = [];
  semesters: any[] = [];
  lecturers: any[] = [];

  courseClass: CourseClass = {
    id: 0,
    classCode: '',
    subjectId: 0,
    semesterId: 0,
    lecturerId: 0,
    maxStudents: 40
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private courseClassService: CourseClassService,
    private subjectService: SubjectService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDropdownData();

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.isEditMode = true;

      this.courseClassService.getCourseClassById(id).subscribe({
        next: (data: any) => {
          this.courseClass = {
            id: Number(data.id ?? data.courseClassId ?? id),
            classCode: data.classCode ?? '',
            subjectId: Number(data.subjectId ?? 0),
            semesterId: Number(data.semesterId ?? 0),
            lecturerId: data.lecturerId !== undefined && data.lecturerId !== null
              ? Number(data.lecturerId)
              : 0,
            maxStudents: Number(data.maxStudents ?? 40)
          };

          this.cdr.detectChanges();
        },
        error: (error) => {
          alert('Không tìm thấy lớp học phần');
          console.error(error);
          this.router.navigate(['/course-classes']);
        }
      });
    }
  }

  loadDropdownData(): void {
    this.subjectService.getSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi tải danh sách môn học:', error);
      }
    });

    this.http.get<any[]>('http://localhost:5059/api/Semesters').subscribe({
      next: (data) => {
        this.semesters = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi tải danh sách học kỳ:', error);
      }
    });

    this.http.get<any[]>('http://localhost:5059/api/Users/lecturers').subscribe({
      next: (data) => {
        this.lecturers = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi tải danh sách giảng viên:', error);
      }
    });
  }

  saveCourseClass(): void {
    if (!this.courseClass.classCode.trim()) {
      alert('Vui lòng nhập mã lớp học phần');
      return;
    }

    if (!this.courseClass.subjectId || this.courseClass.subjectId <= 0) {
      alert('Vui lòng chọn môn học');
      return;
    }

    if (!this.courseClass.lecturerId || Number(this.courseClass.lecturerId) <= 0) {
      alert('Vui lòng chọn giảng viên');
      return;
    }

    if (!this.courseClass.semesterId || this.courseClass.semesterId <= 0) {
      alert('Vui lòng chọn học kỳ');
      return;
    }

    const courseClassToSave: CourseClass = {
      id: Number(this.courseClass.id),
      classCode: this.courseClass.classCode.trim(),
      subjectId: Number(this.courseClass.subjectId),
      semesterId: Number(this.courseClass.semesterId),
      lecturerId: Number(this.courseClass.lecturerId),
      maxStudents: Number(this.courseClass.maxStudents ?? 40)
    };

    if (this.isEditMode) {
      this.courseClassService.updateCourseClass(courseClassToSave).subscribe({
        next: () => {
          alert('Cập nhật lớp học phần thành công');
          this.router.navigate(['/course-classes']);
        },
        error: (error) => {
          console.error(error);
          alert(error.error || 'Cập nhật lớp học phần thất bại');
        }
      });
    } else {
      this.courseClassService.addCourseClass(courseClassToSave).subscribe({
        next: () => {
          alert('Lưu lớp học phần thành công');
          this.router.navigate(['/course-classes']);
        },
        error: (error) => {
          console.error(error);
          alert(error.error || 'Lưu lớp học phần thất bại');
        }
      });
    }
  }
}
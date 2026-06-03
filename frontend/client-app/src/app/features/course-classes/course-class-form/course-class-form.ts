import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CourseClass } from '../../../models/course-class';
import { CourseClassService } from '../../../services/course-class';

@Component({
  selector: 'app-course-class-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './course-class-form.html',
  styleUrls: ['./course-class-form.css']
})
export class CourseClassForm implements OnInit {

  isEditMode = false;

  courseClass: CourseClass = {
    id: 0,
    classCode: '',
    subjectId: 0,
    semesterId: 1,
    lecturerId: null,
    maxStudents: 40
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private courseClassService: CourseClassService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.isEditMode = true;

      this.courseClassService.getCourseClassById(id)
        .subscribe({
          next: (data) => {
            this.courseClass = {
              ...data,
              maxStudents: data.maxStudents ?? 40
            };
          },
          error: (error) => {
            alert('Không tìm thấy lớp học phần');
            console.error(error);
            this.router.navigate(['/course-classes']);
          }
        });
    }
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

    if (!this.courseClass.semesterId || this.courseClass.semesterId <= 0) {
      alert('Vui lòng chọn học kỳ');
      return;
    }

    if (this.isEditMode) {
      this.courseClassService.updateCourseClass(this.courseClass)
        .subscribe({
          next: () => {
            alert('Cập nhật lớp học phần thành công');
            this.router.navigate(['/course-classes']);
          },
          error: (error) => {
            alert(error.error || 'Cập nhật lớp học phần thất bại');
            console.error(error);
          }
        });
    } else {
      this.courseClassService.addCourseClass(this.courseClass)
        .subscribe({
          next: () => {
            alert('Lưu lớp học phần thành công');
            this.router.navigate(['/course-classes']);
          },
          error: (error) => {
            alert(error.error || 'Lưu lớp học phần thất bại');
            console.error(error);
          }
        });
    }
  }
}
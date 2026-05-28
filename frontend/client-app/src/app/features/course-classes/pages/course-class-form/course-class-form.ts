import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { CourseClassService } from '../../services/course-class.service';

@Component({
  selector: 'app-course-class-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './course-class-form.html',
  styleUrls: ['./course-class-form.css']
})
export class CourseClassForm implements OnInit {

  isEditMode = false;

  courseClass = {
    id: 0,
    classCode: '',
    subjectName: '',
    lecturerName: '',
    semester: '',
    academicYear: '',
    maxStudents: 0
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

      const currentCourseClass =
        this.courseClassService.getCourseClassById(id);

      if (currentCourseClass) {
        this.courseClass = {
          id: currentCourseClass.id ?? 0,
          classCode: currentCourseClass.classCode,
          subjectName: currentCourseClass.subjectName,
          lecturerName: currentCourseClass.lecturerName,
          semester: currentCourseClass.semester,
          academicYear: currentCourseClass.academicYear,
          maxStudents: currentCourseClass.maxStudents
        };
      }
    }
  }

  saveCourseClass(): void {
    const classCode = this.courseClass.classCode.trim();

    if (!classCode) {
      alert('Mã lớp học phần không được để trống');
      return;
    }

    if (
      this.courseClassService.isClassCodeExists(
        classCode,
        this.isEditMode ? this.courseClass.id : undefined
      )
    ) {
      alert('Mã lớp học phần đã tồn tại');
      return;
    }

    if (this.courseClass.maxStudents <= 0) {
      alert('Sĩ số tối đa phải lớn hơn 0');
      return;
    }

    this.courseClass.classCode = classCode;

    if (this.isEditMode) {
      this.courseClassService.updateCourseClass(this.courseClass);
      alert('Cập nhật lớp học phần thành công');
    } else {
      this.courseClassService.addCourseClass(this.courseClass);
      alert('Thêm lớp học phần thành công');
    }

    this.router.navigate(['/course-classes']);
  }
}
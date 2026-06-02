import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CourseClass } from '../../../models/course-class';
import { CourseClassService } from '../../../services/course-class';

@Component({
  selector: 'app-course-class-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './course-class-list.html',
  styleUrls: ['./course-class-list.css']
})
export class CourseClassList implements OnInit {

  courseClasses: CourseClass[] = [];
  allCourseClasses: CourseClass[] = [];
  searchKeyword = '';

  constructor(
    private courseClassService: CourseClassService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourseClasses();
  }

  loadCourseClasses(): void {
    this.courseClassService.getCourseClasses()
      .subscribe({
        next: (data) => {
          console.log('Course Classes API:', data);

          this.allCourseClasses = data;
          this.courseClasses = data;

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Lỗi gọi API CourseClasses:', error);
        }
      });
  }

  deleteCourseClass(id: number): void {
    const confirmDelete =
      confirm('Bạn có chắc muốn xóa lớp học phần?');

    if (!confirmDelete) {
      return;
    }

    this.courseClassService.deleteCourseClass(id)
      .subscribe({
        next: () => {
          alert('Xóa lớp học phần thành công');
          this.loadCourseClasses();
        },
        error: (error) => {
          alert('Xóa lớp học phần thất bại');
          console.error(error);
        }
      });
  }

  filterCourseClasses(): void {
    const keyword =
      this.searchKeyword.toLowerCase();

    this.courseClasses =
      this.allCourseClasses.filter(courseClass =>

        courseClass.classCode
          .toLowerCase()
          .includes(keyword)

        ||

        (courseClass.subjectName ?? '')
          .toLowerCase()
          .includes(keyword)

        ||

        (courseClass.lecturerName ?? '')
          .toLowerCase()
          .includes(keyword)

        ||

        (courseClass.semester ?? '')
          .toLowerCase()
          .includes(keyword)

        ||

        (courseClass.academicYear ?? '')
          .toLowerCase()
          .includes(keyword)
      );

    this.cdr.detectChanges();
  }
}
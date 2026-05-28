import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CourseClass } from '../../models/course-class.model';
import { CourseClassService } from '../../services/course-class.service';


@Component({
  selector: 'app-course-class-list',

  imports: [CommonModule, RouterModule, FormsModule],

  templateUrl: './course-class-list.html',
  styleUrls: ['./course-class-list.css']
})
export class CourseClassList implements OnInit {

  courseClasses: CourseClass[] = [];

allCourseClasses: CourseClass[] = [];

searchKeyword = '';

  constructor(
    private courseClassService: CourseClassService
  ) {}

 ngOnInit(): void {

  this.allCourseClasses =
    this.courseClassService.getCourseClasses();

  this.courseClasses =
    this.allCourseClasses;
}

  deleteCourseClass(id: number) {

    const confirmDelete =
      confirm('Bạn có chắc muốn xóa lớp học phần?');

    if (!confirmDelete) {
      return;
    }

    this.courseClassService.deleteCourseClass(id);

    this.courseClasses =
      this.courseClassService.getCourseClasses();
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

      courseClass.subjectName
        .toLowerCase()
        .includes(keyword)

      ||

      courseClass.lecturerName
        .toLowerCase()
        .includes(keyword)

      ||

      courseClass.semester
        .toLowerCase()
        .includes(keyword)

      ||

      courseClass.academicYear
        .toLowerCase()
        .includes(keyword)
    );
}
}
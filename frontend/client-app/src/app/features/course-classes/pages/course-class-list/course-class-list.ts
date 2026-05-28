import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CourseClass } from '../../models/course-class.model';
import { CourseClassService } from '../../services/course-class.service';

@Component({
  selector: 'app-course-class-list',

  imports: [CommonModule, RouterModule],

  templateUrl: './course-class-list.html',
  styleUrls: ['./course-class-list.css']
})
export class CourseClassList implements OnInit {

  courseClasses: CourseClass[] = [];

  constructor(
    private courseClassService: CourseClassService
  ) {}

  ngOnInit(): void {
    this.courseClasses =
      this.courseClassService.getCourseClasses();
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
}
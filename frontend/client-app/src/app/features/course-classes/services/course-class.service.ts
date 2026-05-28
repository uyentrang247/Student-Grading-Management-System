import { Injectable } from '@angular/core';
import { CourseClass } from '../models/course-class.model';

@Injectable({
  providedIn: 'root'
})
export class CourseClassService {

  private courseClasses: CourseClass[] = [
    {
      id: 1,
      classCode: 'WEB101-01',
      subjectName: 'Công nghệ Web',
      lecturerName: 'Nguyễn Văn A',
      semester: 'HK1',
      academicYear: '2025-2026',
      maxStudents: 40
    }
  ];

  getCourseClasses(): CourseClass[] {
    return this.courseClasses;
  }

  addCourseClass(courseClass: CourseClass): void {
    this.courseClasses.push({
      ...courseClass,
      id: Date.now()
    });
  }

  updateCourseClass(updatedCourseClass: CourseClass): void {
    this.courseClasses = this.courseClasses.map(courseClass =>
      courseClass.id === updatedCourseClass.id
        ? updatedCourseClass
        : courseClass
    );
  }

  deleteCourseClass(id: number): void {
    this.courseClasses =
      this.courseClasses.filter(
        courseClass => courseClass.id !== id
      );
  }

  getCourseClassById(id: number): CourseClass | undefined {
    return this.courseClasses.find(
      courseClass => courseClass.id === id
    );
  }
}
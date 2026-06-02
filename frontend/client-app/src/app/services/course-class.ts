import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { CourseClass } from '../models/course-class';

@Injectable({
  providedIn: 'root'
})
export class CourseClassService {

  private apiUrl = 'http://localhost:5059/api/CourseClasses';

  constructor(private http: HttpClient) {}

  getCourseClasses(): Observable<CourseClass[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(data => data.map(item => ({
        id: item.courseClassId,
        classCode: item.classCode,
        subjectId: item.subjectId,
        semesterId: item.semesterId,
        lecturerId: item.lecturerId,
        subjectName: item.subject?.subjectName ?? '',
        lecturerName: item.lecturer?.fullName ?? 'Chưa phân công',
        semester: item.semester?.term ?? '',
        academicYear: item.semester?.academicYear ?? '',
        maxStudents: 40
      })))
    );
  }

  getCourseClassById(id: number): Observable<CourseClass> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(item => ({
        id: item.courseClassId,
        classCode: item.classCode,
        subjectId: item.subjectId,
        semesterId: item.semesterId,
        lecturerId: item.lecturerId,
        subjectName: item.subject?.subjectName ?? '',
        lecturerName: item.lecturer?.fullName ?? 'Chưa phân công',
        semester: item.semester?.term ?? '',
        academicYear: item.semester?.academicYear ?? '',
        maxStudents: 40
      }))
    );
  }

  addCourseClass(courseClass: CourseClass): Observable<CourseClass> {
    return this.http.post<CourseClass>(this.apiUrl, {
      classCode: courseClass.classCode,
      subjectId: courseClass.subjectId,
      semesterId: courseClass.semesterId,
      lecturerId: courseClass.lecturerId ?? null
    });
  }

  updateCourseClass(courseClass: CourseClass): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${courseClass.id}`,
      {
        courseClassId: courseClass.id,
        classCode: courseClass.classCode,
        subjectId: courseClass.subjectId,
        semesterId: courseClass.semesterId,
        lecturerId: courseClass.lecturerId ?? null
      }
    );
  }

  deleteCourseClass(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
import { Injectable } from '@angular/core';
import { StudentGrade } from '../models/student-grade';

@Injectable({
  providedIn: 'root'
})
export class GradeService {

  private enrollments: StudentGrade[] = [

    {
      enrollmentId: 1,
      studentId: 1,
      studentCode: '4651050001',
      fullName: 'Nguyễn Văn An',
      homeroomClass: 'CNTT K46',
      courseClassId: 1,
      classCode: 'WEB101-01',
      processScore: null,
      finalScore: null
    },

    {
      enrollmentId: 2,
      studentId: 2,
      studentCode: '4651050002',
      fullName: 'Trần Thị Bình',
      homeroomClass: 'CNTT K46',
      courseClassId: 1,
      classCode: 'WEB101-01',
      processScore: 8,
      finalScore: 7.5
    },

    {
      enrollmentId: 3,
      studentId: 3,
      studentCode: '4651050003',
      fullName: 'Lê Văn Cường',
      homeroomClass: 'CNTT K46',
      courseClassId: 2,
      classCode: 'JAVA201-01',
      processScore: null,
      finalScore: null
    }
  ];

  getCourseClasses(): string[] {

    return [
      'WEB101-01',
      'JAVA201-01'
    ];
  }

  getStudentsByClass(classCode: string): StudentGrade[] {

    return this.enrollments.filter(
      x => x.classCode === classCode
    );
  }

  saveGrades(data: StudentGrade[]) {

    data.forEach(item => {

      const index =
        this.enrollments.findIndex(
          x => x.enrollmentId === item.enrollmentId
        );

      if (index !== -1) {

        this.enrollments[index] = item;
      }
    });
  }
}
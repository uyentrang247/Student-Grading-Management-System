import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GradeService } from '../../../services/grade';
import { StudentGrade } from '../../../models/student-grade';

@Component({
  selector: 'app-grade-entry',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './grade-entry.html',
  styleUrls: ['./grade-entry.css']
})
export class GradeEntryComponent implements OnInit {

  students: StudentGrade[] = [];

  courseClasses: string[] = [];

  selectedClass = '';

  searchKeyword = '';

  constructor(
    private gradeService: GradeService
  ) {}

  ngOnInit(): void {

    this.courseClasses =
      this.gradeService.getCourseClasses();

    if (this.courseClasses.length > 0) {

      this.selectedClass =
        this.courseClasses[0];

      this.loadStudents();
    }
  }

  loadStudents(): void {

    if (!this.selectedClass) {
      this.students = [];
      return;
    }

    this.students =
      this.gradeService.getStudentsByClass(
        this.selectedClass
      );
  }

  onClassChange(): void {

    this.loadStudents();
  }

  getFilteredStudents(): StudentGrade[] {

    const keyword =
      this.searchKeyword
        .trim()
        .toLowerCase();

    if (!keyword) {
      return this.students;
    }

    return this.students.filter(student =>

      student.studentCode
        .toLowerCase()
        .includes(keyword)

      ||

      student.fullName
        .toLowerCase()
        .includes(keyword)
    );
  }

  saveGrades(): void {

    for (const student of this.students) {

      if (
        student.processScore === null ||
        student.finalScore === null
      ) {

        alert(
          `Sinh viên ${student.studentCode} chưa nhập đủ điểm`
        );

        return;
      }

      if (
        student.processScore < 0 ||
        student.processScore > 10
      ) {

        alert(
          `Điểm quá trình của ${student.studentCode} không hợp lệ`
        );

        return;
      }

      if (
        student.finalScore < 0 ||
        student.finalScore > 10
      ) {

        alert(
          `Điểm cuối kỳ của ${student.studentCode} không hợp lệ`
        );

        return;
      }

      student.processScore =
        Number(student.processScore.toFixed(1));

      student.finalScore =
        Number(student.finalScore.toFixed(1));
    }

    this.gradeService.saveGrades(
      this.students
    );

    alert('Lưu điểm thành công');
  }
}
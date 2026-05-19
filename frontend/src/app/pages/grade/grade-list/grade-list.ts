import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grade-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grade-list.html',
  styleUrl: './grade-list.css'
})
export class GradeList {

  students = [
    {
      studentId: 'SV001',
      fullName: 'Nguyen Van A',
      processScore: 8,
      finalExamScore: 7,
      total10: 7.5,
      letterGrade: 'B',
      gpa4: 3
    }
  ];

  searchText = '';

}
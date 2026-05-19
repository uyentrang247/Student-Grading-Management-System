import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-retake-list',
  imports: [CommonModule],
  templateUrl: './retake-list.html',
  styleUrl: './retake-list.css'
})
export class RetakeList {

  students = [
    {
      studentId: 'SV003',
      fullName: 'Le Van C',
      total10: 3.5,
      letterGrade: 'F'
    }
  ];

}
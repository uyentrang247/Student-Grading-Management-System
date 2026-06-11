import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentGrade } from '../../../models/student-grade';

interface StudentGradeExtended extends StudentGrade {
  average: number | null;
  gradeLetter: string;
  gradeScale4: number | null;
}

@Component({
  selector: 'app-grade-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grade-list.html',
  styleUrls: ['./grade-list.css']
})
export class GradeListComponent {
  @Input() students: StudentGrade[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Output() edit = new EventEmitter<StudentGrade>();

  // Mảng sinh viên đã tính toán sẵn
  displayedStudents: StudentGradeExtended[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.updateDisplayedStudents();
  }

  private updateDisplayedStudents(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const pageStudents = this.students.slice(start, start + this.pageSize);
    
    this.displayedStudents = pageStudents.map(s => ({
      ...s,
      average: this.calculateAverage(s.processScore, s.finalScore),
      gradeLetter: this.getGradeLetter(this.calculateAverage(s.processScore, s.finalScore)),
      gradeScale4: this.getGradeScale4(this.calculateAverage(s.processScore, s.finalScore))
    }));
    
    this.cdr.detectChanges();
  }

  onEdit(student: StudentGradeExtended): void {
    this.edit.emit(student);
  }

  private calculateAverage(process: number | null, final: number | null): number | null {
    if (process !== null && final !== null) {
      return Math.round((process * 0.4 + final * 0.6) * 10) / 10;
    }
    return null;
  }

  private getGradeLetter(score: number | null): string {
    if (score === null) return 'Chưa có';
    if (score >= 9.0) return 'A+';
    if (score >= 8.0) return 'A';
    if (score >= 7.0) return 'B+';
    if (score >= 6.0) return 'B';
    if (score >= 5.0) return 'C';
    if (score >= 4.0) return 'D';
    return 'F';
  }

  private getGradeScale4(score: number | null): number | null {
    if (score === null) return null;
    if (score >= 9.0) return 4.0;
    if (score >= 8.0) return 3.5;
    if (score >= 7.0) return 3.0;
    if (score >= 6.0) return 2.5;
    if (score >= 5.0) return 2.0;
    if (score >= 4.0) return 1.5;
    return 0.0;
  }
}
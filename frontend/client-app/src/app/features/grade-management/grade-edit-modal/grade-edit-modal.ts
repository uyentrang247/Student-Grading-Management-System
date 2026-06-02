import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GradeEntryService, SaveGradeDto } from '../../../services/grade-entry';

@Component({
  selector: 'app-grade-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grade-edit-modal.html',
  styleUrls: ['./grade-edit-modal.css']
})
export class GradeEditModalComponent implements OnChanges {
  @Input() show: boolean = false;
  @Input() student: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  editProcessScore: number | null = null;
  editFinalScore: number | null = null;
  isSaving: boolean = false;

  constructor(
    private gradeEntryService: GradeEntryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(): void {
    if (this.student) {
      this.editProcessScore = this.student.processScore;
      this.editFinalScore = this.student.finalScore;
      this.cdr.detectChanges();
    }
  }

  onClose(): void {
    this.close.emit();
    this.cdr.detectChanges();
  }

  onSave(): void {
    if (this.editProcessScore === null || this.editFinalScore === null) {
      alert('Vui lòng nhập đủ điểm!');
      return;
    }
    
    if (this.editProcessScore < 0 || this.editProcessScore > 10) {
      alert('Điểm quá trình phải từ 0-10');
      return;
    }
    
    if (this.editFinalScore < 0 || this.editFinalScore > 10) {
      alert('Điểm cuối kỳ phải từ 0-10');
      return;
    }
    
    this.isSaving = true;
    this.cdr.detectChanges();
    
    const gradeData: SaveGradeDto[] = [{
      enrollmentId: this.student.enrollmentId,
      courseClassId: this.student.courseClassId,
      processScore: Math.round(this.editProcessScore * 10) / 10,
      finalScore: Math.round(this.editFinalScore * 10) / 10
    }];
    
    this.gradeEntryService.saveGradesBulk(gradeData).subscribe({
      next: () => {
        const updatedStudent = { 
          ...this.student, 
          processScore: gradeData[0].processScore,
          finalScore: gradeData[0].finalScore
        };
        this.isSaving = false;
        this.save.emit(updatedStudent);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Lưu điểm thất bại: ' + (err.error?.message || 'Lỗi kết nối'));
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
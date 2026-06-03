import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Subject } from '../../../models/subject';
import { SubjectService } from '../../../services/subject';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subject-list.html',
  styleUrls: ['./subject-list.css']
})
export class SubjectList implements OnInit {

  subjects: Subject[] = [];
  isLoading = true;

  constructor(
    private subjectService: SubjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.isLoading = true;

    this.subjectService.getSubjects()
      .subscribe({
        next: (data) => {
          this.subjects = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Lỗi gọi API Subjects:', error);
          this.subjects = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  deleteSubject(id: number): void {
    const confirmDelete = confirm('Bạn có chắc muốn xóa môn học?');

    if (!confirmDelete) {
      return;
    }

    this.subjectService.deleteSubject(id)
      .subscribe({
        next: () => {
          alert('Xóa môn học thành công');
          this.loadSubjects();
        },
        error: (error) => {
          console.error(error);

          const errorMessage =
            typeof error.error === 'string'
              ? error.error
              : error.error?.message
                || error.error?.title
                || 'Xóa môn học thất bại';

          alert(errorMessage);
        }
      });
  }
}
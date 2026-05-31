import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SubjectService } from '../../../services/subject';

@Component({
  selector: 'app-subject-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-form.html',
  styleUrls: ['./subject-form.css']
})
export class SubjectForm implements OnInit {

  isEditMode = false;

  subject = {
    subjectId: 0,
    subjectCode: '',
    subjectName: '',
    credits: 0,
    processWeight: 0,
    finalWeight: 0
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.isEditMode = true;

      this.subjectService.getSubjectById(id)
        .subscribe({
          next: (currentSubject) => {
            this.subject = {
              subjectId: currentSubject.subjectId ?? 0,
              subjectCode: currentSubject.subjectCode,
              subjectName: currentSubject.subjectName,
              credits: currentSubject.credits,
              processWeight: currentSubject.processWeight,
              finalWeight: currentSubject.finalWeight
            };
          },
          error: (error) => {
            alert('Không tìm thấy môn học');
            console.error(error);
            this.router.navigate(['/subjects']).then(() => {
              window.location.reload();
            });
          }
        });
    }
  }

  saveSubject(): void {
    const totalWeight =
      Number(this.subject.processWeight) +
      Number(this.subject.finalWeight);

    if (totalWeight !== 100) {
      alert('Tổng trọng số phải bằng 100%');
      return;
    }

    if (this.isEditMode) {
      this.subjectService.updateSubject(
        this.subject.subjectId,
        this.subject
      ).subscribe({
        next: () => {
          alert('Cập nhật môn học thành công');
          this.router.navigate(['/subjects']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          alert(error.error || 'Cập nhật môn học thất bại');
          console.error(error);
        }
      });
    } else {
      this.subjectService.addSubject(this.subject)
        .subscribe({
          next: () => {
            alert('Lưu môn học thành công');
            this.router.navigate(['/subjects']).then(() => {
              window.location.reload();
            });
          },
          error: (error) => {
            alert(error.error || 'Lưu môn học thất bại');
            console.error(error);
          }
        });
    }
  }
}
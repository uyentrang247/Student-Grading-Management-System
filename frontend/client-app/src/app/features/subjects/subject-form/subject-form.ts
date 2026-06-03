import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SubjectService } from '../../../services/subject';

@Component({
  selector: 'app-subject-form',
  imports: [CommonModule, FormsModule, RouterModule],
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
    private subjectService: SubjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.isEditMode = true;

      this.subjectService.getSubjectById(id).subscribe({
        next: (currentSubject) => {
          const processWeightFromApi = Number(currentSubject.processWeight ?? 0);
          const finalWeightFromApi = Number(currentSubject.finalWeight ?? 0);

          this.subject = {
            subjectId: currentSubject.subjectId ?? 0,
            subjectCode: currentSubject.subjectCode ?? '',
            subjectName: currentSubject.subjectName ?? '',
            credits: Number(currentSubject.credits ?? 0),

            // Backend trả 0.4 thì form hiện 40
            processWeight: processWeightFromApi <= 1
              ? processWeightFromApi * 100
              : processWeightFromApi,

            // Backend trả 0.6 thì form hiện 60
            finalWeight: finalWeightFromApi <= 1
              ? finalWeightFromApi * 100
              : finalWeightFromApi
          };

          this.cdr.detectChanges();
        },
        error: (error) => {
          alert('Không tìm thấy môn học');
          console.error(error);
          this.router.navigate(['/subjects']);
        }
      });
    }
  }

  saveSubject(): void {
    const credits = Number(this.subject.credits);
    const processWeight = Number(this.subject.processWeight);
    const finalWeight = Number(this.subject.finalWeight);
    const totalWeight = processWeight + finalWeight;

    if (!this.subject.subjectCode.trim()) {
      alert('Vui lòng nhập mã môn học');
      return;
    }

    if (!this.subject.subjectName.trim()) {
      alert('Vui lòng nhập tên môn học');
      return;
    }

    if (credits < 1 || credits > 6) {
      alert('Số tín chỉ phải từ 1 đến 6');
      return;
    }

    if (processWeight < 30 || finalWeight < 30) {
      alert('Mỗi trọng số phải từ 30% trở lên');
      return;
    }

    if (Math.abs(totalWeight - 100) > 0.0001) {
      alert('Tổng trọng số phải bằng 100%');
      return;
    }

    // Form nhập 30/70, backend nhận 0.3/0.7
    const subjectToSave = {
      subjectId: this.subject.subjectId,
      subjectCode: this.subject.subjectCode.trim(),
      subjectName: this.subject.subjectName.trim(),
      credits: credits,
      processWeight: processWeight / 100,
      finalWeight: finalWeight / 100
    };

    if (this.isEditMode) {
      this.subjectService.updateSubject(
        this.subject.subjectId,
        subjectToSave
      ).subscribe({
        next: () => {
          alert('Cập nhật môn học thành công');
          this.router.navigate(['/subjects']);
        },
        error: (error) => {
          console.error(error);

          const errorMessage =
            typeof error.error === 'string'
              ? error.error
              : error.error?.message
                || error.error?.title
                || 'Cập nhật môn học thất bại';

          alert(errorMessage);
        }
      });
    } else {
      this.subjectService.addSubject(subjectToSave).subscribe({
        next: () => {
          alert('Lưu môn học thành công');
          this.router.navigate(['/subjects']);
        },
        error: (error) => {
          console.error(error);

          const errorMessage =
            typeof error.error === 'string'
              ? error.error
              : error.error?.message
                || error.error?.title
                || 'Lưu môn học thất bại';

          alert(errorMessage);
        }
      });
    }
  }
}
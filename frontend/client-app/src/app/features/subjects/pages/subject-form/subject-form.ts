import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SubjectService } from '../../services/subject.service';

@Component({
  selector: 'app-subject-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-form.html',
  styleUrls: ['./subject-form.css']
})
export class SubjectForm implements OnInit {

  isEditMode = false;

  subject = {
    id: 0,
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

      const currentSubject = this.subjectService.getSubjectById(id);

      if (currentSubject) {
        this.subject = {
  id: currentSubject.id ?? 0,
  subjectCode: currentSubject.subjectCode,
  subjectName: currentSubject.subjectName,
  credits: currentSubject.credits,
  processWeight: currentSubject.processWeight,
  finalWeight: currentSubject.finalWeight
};
      }
    }
  }

  saveSubject(): void {
    const totalWeight =
      this.subject.processWeight + this.subject.finalWeight;

    if (totalWeight !== 100) {
      alert('Tổng trọng số phải bằng 100%');
      return;
    }

    if (this.isEditMode) {
      this.subjectService.updateSubject(this.subject);
      alert('Cập nhật môn học thành công');
    } else {
      this.subjectService.addSubject(this.subject);
      alert('Lưu môn học thành công');
    }

    this.router.navigate(['/subjects']);
  }
}
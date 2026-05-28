import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubjectService } from '../../services/subject.service';

@Component({
  selector: 'app-subject-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-form.html',
  styleUrls: ['./subject-form.css']
})
export class SubjectForm {
  subject = {
    subjectCode: '',
    subjectName: '',
    credits: 0,
    processWeight: 0,
    finalWeight: 0
  };

 constructor(
  private router: Router,
  private subjectService: SubjectService
) {}

  saveSubject() {
    const totalWeight =
      this.subject.processWeight + this.subject.finalWeight;

    if (totalWeight !== 100) {
      alert('Tổng trọng số phải bằng 100%');
      return;
    }
this.subjectService.addSubject(this.subject);
    alert('Lưu môn học thành công');
    this.router.navigate(['/subjects']);
  }
}
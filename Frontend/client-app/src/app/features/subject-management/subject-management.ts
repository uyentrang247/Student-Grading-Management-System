import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subject-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-management.html'
})
export class SubjectManagementComponent {
  subjects: any[] = [{ code: 'IT01', name: 'Lập trình Web', credits: 3, pw: 40, fw: 60 }];
  newSubject = { code: '', name: '', credits: 0, pw: 0, fw: 0 };
  isShowingForm = false;
  editingIndex: number | null = null;

  openForm() { this.isShowingForm = true; }
  closeForm() { this.isShowingForm = false; }
  editSubject(subject: any, index: number) {

  this.newSubject = { ...subject };

  this.editingIndex = index;

  this.isShowingForm = true;
}

  saveSubject() {

  if (this.newSubject.pw + this.newSubject.fw !== 100) {
    alert("❌ Tổng trọng số phải bằng 100%!");
    return;
  }

  if (this.editingIndex !== null) {

    this.subjects[this.editingIndex] = { ...this.newSubject };

    this.editingIndex = null;

  } else {

    this.subjects.push({ ...this.newSubject });

  }

  this.closeForm();

  alert("✅ Lưu môn học thành công!");
}
}

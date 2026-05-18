import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subject-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-management.html',
  styleUrls: ['./subject-management.css']
})
export class SubjectManagementComponent {
  isShowingForm: boolean = false;
  isEditing: boolean = false; // Để phân biệt đang Thêm hay đang Sửa
  editingIndex: number = -1;

  subjects: any[] = [
    { code: 'IT01', name: 'Lập trình Web', credits: 3, pw: 40, fw: 60 },
    { code: 'IT02', name: 'Cơ sở dữ liệu', credits: 2, pw: 30, fw: 70 }
  ];

  newSubject = { code: '', name: '', credits: 0, pw: 0, fw: 0 };

  openForm(editMode: boolean = false, index: number = -1) {
    this.isShowingForm = true;
    this.isEditing = editMode;
    
    if (editMode && index !== -1) {
      this.editingIndex = index;
      // Copy dữ liệu từ bảng vào Form để sửa
      this.newSubject = { ...this.subjects[index] };
    } else {
      this.editingIndex = -1;
      this.newSubject = { code: '', name: '', credits: 0, pw: 0, fw: 0 };
    }
  }

  closeForm() {
    this.isShowingForm = false;
    this.isEditing = false;
  }

  saveSubject() {
    const total = this.newSubject.pw + this.newSubject.fw;
    if (total !== 100) {
      alert("❌ Lỗi: Tổng trọng số phải bằng 100%!");
      return;
    }

    if (this.isEditing) {
      // Cập nhật môn học cũ
      this.subjects[this.editingIndex] = { ...this.newSubject };
      alert("✅ Đã cập nhật môn học!");
    } else {
      // Thêm môn học mới
      this.subjects.push({ ...this.newSubject });
      alert("✅ Đã thêm môn học thành công!");
    }
    this.closeForm();
  }

  deleteSubject(index: number) {
    if (confirm("Bạn có chắc chắn muốn xóa môn học này?")) {
      this.subjects.splice(index, 1);
    }
  }
}

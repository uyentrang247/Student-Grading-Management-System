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
  // Mảng chứa danh sách môn học hiển thị trên bảng
  subjects: any[] = [
    { code: 'IT01', name: 'Lập trình Web', credits: 3, pw: 40, fw: 60 },
    { code: 'IT02', name: 'Cấu trúc dữ liệu', credits: 2, pw: 30, fw: 70 }
  ];

  // Đối tượng dùng cho Form thêm mới
  newSubject = { code: '', name: '', credits: 0, pw: 0, fw: 0 };

  // Hàm Lưu môn học [UC09]
  saveSubject() {
    // 1. Kiểm tra logic tổng trọng số phải bằng 100%
    const total = this.newSubject.pw + this.newSubject.fw;

    if (total !== 100) {
      alert("❌ Lỗi: Tổng trọng số Quá trình và Cuối kỳ phải bằng 100%!");
      return;
    }

    // 2. Kiểm tra không để trống mã/tên môn
    if (!this.newSubject.code || !this.newSubject.name) {
      alert("❌ Vui lòng nhập đầy đủ Mã và Tên môn học!");
      return;
    }

    // 3. Thêm vào danh sách (Sẽ được thay bằng API sau này)
    this.subjects.push({ ...this.newSubject });

    // 4. Reset form về trạng thái trống
    this.newSubject = { code: '', name: '', credits: 0, pw: 0, fw: 0 };
    alert("✅ Đã thêm môn học thành công!");
  }

  // Hàm xóa môn học [UC11]
  deleteSubject(index: number) {
    if (confirm("Bạn có chắc chắn muốn xóa môn học này?")) {
      this.subjects.splice(index, 1);
    }
  }
}

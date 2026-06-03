import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../services/student'; // Điều chỉnh lại đường dẫn cho đúng service của bạn nhé
import { StudentResponse } from '../../../models/student';
import { HomeroomClassResponse } from '../../../models/homeroomclass';

@Component({
  selector: 'app-student-edit',
  templateUrl: './student-edit.html',
  styleUrls: ['./student-edit.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule] 
})
export class StudentEditComponent implements OnInit {
  studentForm!: FormGroup;
  studentId!: number;
  homeroomClasses: HomeroomClassResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService
  ) { }

  ngOnInit(): void {
    // 1. Khởi tạo cấu trúc form kèm Validation chặt chẽ giống bên .NET Core của bạn
    this.studentForm = this.fb.group({
      studentCode: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Ép đúng 10 chữ số
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      homeroomClassId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    // 2. Tải danh sách lớp thực tế đổ vào dropdown
    this.loadHomeroomClasses();

    // 3. Bốc ID từ thanh địa chỉ (Route) và gọi API lấy thông tin sinh viên cũ
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.studentId) {
      this.loadStudentDetail();
    }
  }

  loadHomeroomClasses(): void {
    this.studentService.getHomeroomClasses().subscribe({
      next: (data) => this.homeroomClasses = data,
      error: (err) => console.error('Lỗi khi tải danh sách lớp:', err)
    });
  }

  loadStudentDetail(): void {
    this.studentService.getStudentById(this.studentId).subscribe({
      next: (student) => {
        // Mẹo nhỏ: Cắt chuỗi lấy định dạng YYYY-MM-DD để ô input type="date" của HTML hiểu được dữ liệu cũ
        const formattedDate = student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '';

        // Đổ (patchValue) dữ liệu cũ từ DB vào Form trên giao diện
        this.studentForm.patchValue({
          studentCode: student.studentCode,
          lastName: student.lastName,
          firstName: student.firstName,
          gender: student.gender,
          dateOfBirth: formattedDate,
          homeroomClassId: student.homeroomClassId,
          email: student.email
        });
      },
      error: (err) => console.error('Lỗi khi tải chi tiết sinh viên:', err)
    });
  }

  // Xử lý khi nhấn nút Lưu thay đổi
  onSubmit(): void {
    if (this.studentForm.valid) {
      this.studentService.updateStudent(this.studentId, this.studentForm.value).subscribe({
        next: (responseMessage) => {
          alert(responseMessage); // Hiện "Cập nhật thành công!" từ .NET trả về
          this.router.navigate(['/student']); // Lưu xong tự động quay về trang danh sách sinh viên
        },
        error: (err) => console.error('Lỗi khi cập nhật dữ liệu:', err)
      });
    } else {
      // Nếu form nhập liệu chưa hợp lệ (ví dụ thiếu trường), tự động kích hoạt hiện lỗi đỏ lòm lên cho user thấy
      this.studentForm.markAllAsTouched();
    }
  }

  // Nhấn hủy bỏ quay lại trang list
  onCancel(): void {
    this.router.navigate(['/student']);
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../services/student'; 
import { HomeroomClassResponse } from '../../../models/homeroomclass';

@Component({
  selector: 'app-student-create',
  templateUrl: './student-create.html',
  styleUrls: ['./student-create.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule] 
})
export class StudentCreateComponent implements OnInit {
  studentForm!: FormGroup;
  homeroomClasses: HomeroomClassResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private studentService: StudentService
  ) { }

  ngOnInit(): void {
    // Khởi tạo form trống hoàn toàn kèm các điều kiện Validation giống hệt .NET
    this.studentForm = this.fb.group({
      studentCode: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], 
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      homeroomClassId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    // Tải danh sách lớp thực tế đổ vào dropdown chọn
    this.loadHomeroomClasses();
  }

  loadHomeroomClasses(): void {
    this.studentService.getHomeroomClasses().subscribe({
      next: (data) => this.homeroomClasses = data,
      error: (err) => console.error('Lỗi khi tải danh sách lớp:', err)
    });
  }

  // Xử lý khi nhấn nút Thêm Mới
  onSubmit(): void {
    if (this.studentForm.valid) {
      // 🌟 Gọi hàm createStudent từ Service để gửi DTO lên .NET
      this.studentService.createStudent(this.studentForm.value).subscribe({
        next: (responseMessage) => {
          alert(responseMessage); // Hiện "Thêm sinh viên thành công!" trả về từ .NET
          this.router.navigate(['/student']); // Thêm xong tự chuyển về trang danh sách
        },
        error: (err) => console.error('Lỗi khi thêm mới sinh viên:', err)
      });
    } else {
      // Kích hoạt hiển thị lỗi đỏ nếu user điền thiếu
      this.studentForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/student']);
  }
}
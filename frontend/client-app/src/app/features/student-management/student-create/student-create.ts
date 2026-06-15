import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../services/student'; 
import { HomeroomClassResponse } from '../../../models/homeroomclass';
import { StudentFormComponent } from '../components/student-form/student-form';

@Component({
  selector: 'app-student-create',
  templateUrl: './student-create.html',
  styleUrls: ['./student-create.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, StudentFormComponent] 
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
      // Ép kiểu dữ liệu trước khi gửi để tránh lỗi Validation 400 từ .NET
      const formValues = { ...this.studentForm.value };
      formValues.homeroomClassId = Number(formValues.homeroomClassId);

      // Gọi API createStudent 
      this.studentService.createStudent(formValues).subscribe({
        next: (res) => {
          // CẬP NHẬT: Hiện message từ Object JSON do .NET trả về
          alert(res.message); 
          this.router.navigate(['admin/students']); 
        },
        error: (err) => {
          console.error('Lỗi khi thêm mới sinh viên:', err);
          // CẬP NHẬT: Hiển thị cảnh báo nếu bị trùng mã sinh viên hoặc lỗi do .NET báo về
          if (err.error?.message) {
            alert(err.error.message);
          } else {
            alert('Có lỗi hệ thống xảy ra khi thêm mới sinh viên!');
          }
        }
      });
    } else {
      // Kích hoạt hiển thị lỗi đỏ nếu user điền thiếu
      this.studentForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['admin/students']);
  }
}
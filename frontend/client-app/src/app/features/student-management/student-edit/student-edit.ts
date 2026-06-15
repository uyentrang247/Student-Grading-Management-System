import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../services/student'; 
import { StudentResponse } from '../../../models/student';
import { HomeroomClassResponse } from '../../../models/homeroomclass';
import { StudentFormComponent } from '../components/student-form/student-form';

@Component({
  selector: 'app-student-edit',
  templateUrl: './student-edit.html',
  styleUrls: ['./student-edit.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, StudentFormComponent] 
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
    // Khởi tạo cấu trúc form kèm Validation
    this.studentForm = this.fb.group({
      studentCode: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], 
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      homeroomClassId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.loadHomeroomClasses();

    // Lấy ID và load dữ liệu cũ
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
        const formattedDate = student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '';

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
      error: (err) => {
        console.error('Lỗi khi tải chi tiết sinh viên:', err);
        alert('Không tìm thấy dữ liệu sinh viên!');
        this.router.navigate(['admin/students']);
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      // Mẹo nhỏ: Ép kiểu homeroomClassId về số nguyên, vì form HTML đôi khi trả về string khiến API .NET chê dữ liệu không hợp lệ
      const formValues = { ...this.studentForm.value };
      formValues.homeroomClassId = Number(formValues.homeroomClassId);
      
      // Xử lý gửi dữ liệu
      this.studentService.updateStudent(this.studentId, formValues).subscribe({
        next: (res) => {
          // CẬP NHẬT: Nhận res.message từ Object JSON
          alert(res.message); 
          this.router.navigate(['admin/students']); 
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật dữ liệu:', err);
          // CẬP NHẬT: Bắt lỗi trùng mã sinh viên (400 Bad Request) từ .NET trả về
          if (err.error?.message) {
            alert(err.error.message);
          } else {
            alert('Có lỗi xảy ra khi cập nhật thông tin!');
          }
        }
      });
    } else {
      this.studentForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['admin/students']);
  }
}
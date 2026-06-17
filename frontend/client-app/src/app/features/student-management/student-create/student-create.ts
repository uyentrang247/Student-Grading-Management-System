import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../services/student'; 
import { ClassLookup } from '../../../models/student';

@Component({
  selector: 'app-student-create',
  templateUrl: './student-create.html',
  styleUrls: ['./student-create.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule] 
})
export class StudentCreateComponent implements OnInit {
  studentForm!: FormGroup;
  homeroomClasses: ClassLookup[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private studentService: StudentService
  ) { }

  ngOnInit(): void {
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
  }

  loadHomeroomClasses(): void {
    this.studentService.getHomeroomClasses().subscribe({
      next: (data) => this.homeroomClasses = data,
      error: (err) => console.error('Lỗi khi tải danh sách lớp:', err)
    });
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      // Chuyển đổi homeroomClassId từ string sang number trước khi gửi lên server
      const formValues = { ...this.studentForm.value };
      formValues.homeroomClassId = Number(formValues.homeroomClassId);

      this.studentService.createStudent(formValues).subscribe({
        next: (res) => {
          alert(res.message); 
          this.router.navigate(['admin/students']); 
        },
        error: (err) => {
          console.error('Lỗi khi thêm mới sinh viên:', err);
          if (err.error?.message) {
            alert(err.error.message);
          } else {
            alert('Có lỗi hệ thống xảy ra khi thêm mới sinh viên!');
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
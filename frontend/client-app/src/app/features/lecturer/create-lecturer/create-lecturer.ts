import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LecturerService } from '../../../services/lecturer.service';

@Component({
  selector: 'app-create-lecturer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-lecturer.html',
  styleUrls: ['./create-lecturer.css']
})
export class CreateLecturerComponent implements OnInit {
  lecturer: any = { username: '', fullName: '', email: '', facultyId: 0 };
  faculties: any[] = [];
  isLoading: boolean = false;

  constructor(
    private lecturerService: LecturerService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.lecturerService.getFaculties().subscribe({
      next: (data) => this.faculties = data,
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    if (this.isLoading) return;
    this.isLoading = true;

    // Lấy dữ liệu trực tiếp từ DOM để đảm bảo không bị lỗi sync
    const payload = {
      username: (document.querySelector('input[name="username"]') as HTMLInputElement)?.value.trim(),
      fullName: (document.querySelector('input[name="fullName"]') as HTMLInputElement)?.value.trim(),
      email: (document.querySelector('input[name="email"]') as HTMLInputElement)?.value.trim(),
      facultyId: Number(this.lecturer.facultyId)
    };

    this.lecturerService.createLecturer(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // Bồ sẽ thấy thông báo gửi mail thành công hay thất bại ở đây
        alert(res.message || 'Thêm giảng viên thành công!');
        this.router.navigate(['/admin/lecturers']);
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges(); // Ép UI cập nhật để nhả nút bấm
        
        setTimeout(() => {
          const msg = err.error?.message || (err.error?.errors ? JSON.stringify(err.error.errors) : "Lỗi hệ thống!");
          alert("LỖI: " + msg);
        }, 100);
      }
    });
  }
}
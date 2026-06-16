import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { EnrollmentService } from '../../../services/enrollment';
import { ClassDetailsResponse, EnrollmentStudent } from '../../../models/enrollment';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './class-detail.html',
  styleUrl: './class-detail.css'
  })
export class ClassDetailComponent implements OnInit {
  classId!: number;
  classDetails: ClassDetailsResponse | null = null;
  // Biến lưu mã sinh viên khi nhập thủ công từ ô Input
  inputStudentCode: string = '';
  // File Excel được chọn để chuẩn bị Import
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private enrollmentService: EnrollmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id'); // Lấy ID lớp học phần từ URL (route parameter)
  if (idParam) {
    this.classId = +idParam; // Chuyển đổi sang số nguyên
    this.loadClassDetails(); 
  }
  }

  /**
   * 1. Lấy thông tin lớp và danh sách thành viên hiện tại trong lớp
   */
  loadClassDetails(): void {
    this.enrollmentService.getClassDetails(this.classId).subscribe({
      next: (data) => {
        this.classDetails = data;
        this.cdr.detectChanges(); // Ép giao diện render danh sách sinh viên lập tức
      },
      error: (err) => {
        console.error('Lỗi khi tải chi tiết lớp học phần:', err);
        alert('Không thể tải dữ liệu lớp học phần này.');
      }
    });
  }


   //Thêm thủ công một sinh viên vào lớp bằng Mã số sinh viên
  onAddStudentManual(): void {
    if (!this.inputStudentCode.trim()) {
      alert('Vui lòng nhập mã sinh viên.');
      return;
    }

    this.enrollmentService.addStudentManual(this.classId, this.inputStudentCode.trim()).subscribe({
      next: (res) => {
          console.log(res);
        if (res.isSuccess) {
         
          alert(res.message);
          this.inputStudentCode = ''; // Xóa sạch ô nhập liệu sau khi thêm thành công
          this.loadClassDetails();    
        }
      },
      error: (err) => {
        // Đọc thông báo lỗi từ Backend gửi về (Ví dụ: Sinh viên đã tồn tại, mã không đúng...)
        const errMsg = err.error?.message || 'Có lỗi xảy ra khi thêm sinh viên.';
        alert(errMsg);
      }
    });
  }

  //Khi người dùng chọn file Excel từ máy tính
  
  onFileChange(event: any): void {
    const file = event.target.files[0];// Lấy file được chọn(file don)
    if (file) {
      this.selectedFile = file;
    }
  }

  
   //Tải file Excel lên Server để Import hàng loạt
  
  onUploadExcel(): void {
    if (!this.selectedFile) {
      alert('Vui lòng chọn một file Excel trước khi bấm tải lên.');
      return;
    }

    this.enrollmentService.importExcel(this.classId, this.selectedFile).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          let alertMsg = res.message;
          // Nếu có danh sách dòng lỗi (trùng mã, sai định dạng), hiển thị ra cho người dùng biết
          if (res.errors && res.errors.length > 0) {
            alertMsg += '\n\nChi tiết các dòng bị bỏ qua:\n' + res.errors.join('\n');
          }
          alert(alertMsg);
          this.selectedFile = null; 
    
          this.loadClassDetails();  
        }
      },
      error: (err) => {
        const errMsg = err.error?.message || 'Có lỗi xảy ra khi Import file Excel.';
        alert(errMsg);
      }
    });
  }

    // Xóa sinh viên khỏi lớp học phần (Nút hành động cuối Table)
  onRemoveStudent(studentId: number, studentCode: string, lastName: string, firstName: string): void {
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa sinh viên [${studentCode}] ${lastName} ${firstName} khỏi lớp học phần này?`);
    
    if (!confirmDelete) return;

    this.enrollmentService.removeStudent(this.classId, studentId).subscribe({
      next: (res) => {
         console.log(res);
        if (res.isSuccess) {
          alert(res.message);
           this.loadClassDetails(); 
        }
      },
      error: (err) => {
        const errMsg = err.error?.message || 'Không thể xóa sinh viên này.';
        alert(errMsg);
      }
    });
  }
}
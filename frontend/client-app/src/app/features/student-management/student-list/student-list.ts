import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/student'; 
import { StudentResponse } from '../../../models/student';
import { HomeroomClassResponse } from '../../../models/homeroomclass'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core'; 

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.html',
  styleUrls: ['./student-list.css'],
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true, 
})
export class StudentListComponent implements OnInit {
  // CẬP NHẬT: Chỉ cần một mảng chứa dữ liệu của trang hiện tại mang về từ API
  students: StudentResponse[] = [];    
  homeroomClasses: HomeroomClassResponse[] = []; 

  searchTerm: string = '';
  selectedClassId?: number;

  // --- CÁC BIẾN QUẢN LÝ PHÂN TRANG TỪ SERVER ---
  currentPage: number = 1;   // Trang hiện tại
  pageSize: number = 10;     // Số sinh viên trên một trang
  totalPages: number = 1;    // Tổng số trang (sẽ tính từ totalRecords)
  totalRecords: number = 0;  // Tổng số bản ghi thỏa mãn bộ lọc

  constructor(
    private studentService: StudentService, 
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.loadHomeroomClasses(); 
    this.loadStudents();       
  }

  // 1. Tải danh sách lớp vào dropdown lọc
  loadHomeroomClasses(): void {
    this.studentService.getHomeroomClasses().subscribe({
      next: (data) => {
        this.homeroomClasses = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách lớp sinh hoạt:', err);
      }
    });
  }

  // 2. Gọi API lấy danh sách sinh viên kết hợp lọc và phân trang từ DB
  loadStudents(): void {
    // CẬP NHẬT: Truyền thêm currentPage và pageSize vào Service
    this.studentService.getStudents(this.selectedClassId, this.searchTerm, this.currentPage, this.pageSize)
      .subscribe({
        next: (result) => {
          // Gán mảng dữ liệu trang hiện tại
          this.students = result.data; 
          this.totalRecords = result.totalRecords;
          
          // Tính toán tổng số trang dựa trên tổng số bản ghi từ Database trả về
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize) || 1;

          // Nếu trang hiện tại lớn hơn tổng số trang (ví dụ sau khi lọc bớt dữ liệu), đưa về trang 1 và tải lại
          if (this.currentPage > this.totalPages) {
            this.currentPage = 1;
            this.loadStudents();
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi hệ thống khi lấy danh sách sinh viên:', err);
        }
      });
  }

  // 3. Kích hoạt khi bấm nút tìm kiếm hoặc thay đổi Dropdown lớp
  onSearch(): void {
    this.currentPage = 1; // Khởi động lại về trang đầu tiên khi có bộ lọc mới
    this.loadStudents();
  }

  // 4. Hàm xử lý chuyển trang khi bấm nút Tiến / Lùi / Số trang
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadStudents();  // CẬP NHẬT: Phải gọi lại API để lấy dữ liệu của trang mới
    }
  }

  // 5. Xử lý xóa sinh viên
  onDelete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa sinh viên này không?')) {
      this.studentService.deleteStudent(id).subscribe({
        next: (res) => {
          // CẬP NHẬT: Nhận res.message từ Object JSON
          alert(res.message); 
          this.loadStudents(); // Tải lại trang hiện tại sau khi xóa thành công    
        },
        error: (err) => {
          console.error('Lỗi khi thực hiện xóa:', err);
          // Kiểm tra nếu Backend trả về Object lỗi có message công khai
          if (err.error?.message) {
            alert(err.error.message);
          } else {
            alert('Xóa sinh viên thất bại!');
          }
        }
      });
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/student'; 
import { StudentResponse, ClassLookup } from '../../../models/student';
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
  students: StudentResponse[] = [];    
  homeroomClasses: ClassLookup[] = []; 

  searchTerm: string = '';
  selectedClassId?: number;

  currentPage: number = 1;   
  pageSize: number = 10;     
  totalPages: number = 1;    
  totalRecords: number = 0;  

  constructor(
    private studentService: StudentService, 
    private cdr: ChangeDetectorRef //đảm bảo chắc chắn UI luôn cập nhật đúng lúc.
  ) { }

  ngOnInit(): void {
    this.loadHomeroomClasses(); 
    this.loadStudents();       
  }

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
          
          // Tính toán tổng số trang 
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
          alert(res.message); 
          this.loadStudents(); 
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
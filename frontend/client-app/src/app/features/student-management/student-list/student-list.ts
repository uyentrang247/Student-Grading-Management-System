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
  allStudents: StudentResponse[] = []; // Bộ lưu trữ toàn bộ dữ liệu để cắt mảng
  students: StudentResponse[] = [];    // Mảng chứa dữ liệu thực tế hiển thị trên một trang
  homeroomClasses: HomeroomClassResponse[] = []; 

  searchTerm: string = '';
  selectedClassId?: number;

  // --- CÁC BIẾN PHÂN TRANG FRONTEND ĐÃ ĐƯỢC RÚT GỌN ---
  currentPage: number = 1;   // Trang hiện tại
  pageSize: number = 10;     // Số sinh viên trên một trang
  totalPages: number = 1;    // Tổng số trang

  constructor(
    private studentService: StudentService, 
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.loadHomeroomClasses(); 
    this.loadStudents();       
  }

  // 1. Tải danh sách lớp vào dropdown
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

  // 2. Gọi API lấy danh sách sinh viên
  loadStudents(): void {
    this.studentService.getStudents(this.selectedClassId, this.searchTerm)
      .subscribe({
        next: (data) => {
          this.allStudents = data; 
          this.paginateStudents(); // Thực hiện phân trang thủ công
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi hệ thống khi lấy danh sách sinh viên:', err);
        }
      });
  }

  // 3. Hàm tính toán và thực hiện cắt mảng theo trang
  paginateStudents(): void {
    // Tính tổng số trang dựa trên độ dài dữ liệu thực tế thu được
    this.totalPages = Math.ceil(this.allStudents.length / this.pageSize) || 1;
    
    // Nếu trang hiện tại vượt quá tổng số trang, tự động đưa về trang 1
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    // --- ĐÃ BỎ TOÀN BỘ THUẬT TOÁN DẤU BA CHẤM VÀ PAGESARRAY DƯ THỪA ---

    // Cắt mảng lấy đúng vị trí dữ liệu của trang hiện tại
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.students = this.allStudents.slice(startIndex, endIndex);
  }

  // 4. Kích hoạt khi bấm nút tìm kiếm hoặc đổi lớp
  onSearch(): void {
    this.currentPage = 1;
    this.loadStudents();
  }

  // 5. Hàm xử lý chuyển trang bằng nút bấm tiến/lùi
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.paginateStudents();  // Chuyển trang mượt mà bằng cách cắt lại dữ liệu
      this.cdr.detectChanges(); // Ép render giao diện mới
    }
  }

  // 6. Xử lý xóa sinh viên
  onDelete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa sinh viên này không?')) {
      this.studentService.deleteStudent(id).subscribe({
        next: (responseMessage) => {
          alert(responseMessage); 
          this.loadStudents();    
        },
        error: (err) => {
          console.error('Lỗi khi thực hiện xóa:', err);
        }
      });
    }
  }
}
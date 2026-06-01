import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/student'; 
import { StudentResponse } from '../../../models/student';
import { HomeroomClassResponse } from '../../../models/homeroomclass'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.html',
  styleUrls: ['./student-list.css'],
  standalone: true, // Nếu là standalone
  imports: [CommonModule, FormsModule]
})
export class StudentListComponent implements OnInit {
  // Mảng chứa dữ liệu thật hứng từ database đổ về
  students: StudentResponse[] = [];
  homeroomClasses: HomeroomClassResponse[] = []; 

  // Các biến bound 2 chiều với ô Tìm kiếm và Ô chọn lớp
  searchTerm: string = '';
  selectedClassId?: number;

  constructor(private studentService: StudentService) { }

  ngOnInit(): void {
    this.loadStudents();       // Vừa vào trang là tải danh sách sinh viên liền
    this.loadHomeroomClasses(); // Tải danh sách lớp thật từ DB bỏ vào ô select dropdown
  }

  // 1. Gọi API bốc danh sách lớp thật từ database đổ vào ô Dropdown lọc
  loadHomeroomClasses(): void {
    this.studentService.getHomeroomClasses().subscribe({
      next: (data) => {
        this.homeroomClasses = data;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách lớp sinh hoạt:', err);
      }
    });
  }

  // 2. Gọi API lấy danh sách sinh viên (có kèm bộ lọc lớp và từ khóa tìm kiếm)
  loadStudents(): void {
    this.studentService.getStudents(this.selectedClassId, this.searchTerm)
      .subscribe({
        next: (data) => {
          this.students = data;
        },
        error: (err) => {
          console.error('Lỗi hệ thống khi lấy danh sách sinh viên:', err);
        }
      });
  }

  // 3. Hàm kích hoạt lại việc load dữ liệu khi người dùng gõ tìm kiếm hoặc đổi lớp
onSearch(): void {
    this.loadStudents();
  }
  // 4. Xử lý sự kiện khi nhấn nút Xóa sinh viên
  onDelete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa sinh viên này không?')) {
      this.studentService.deleteStudent(id).subscribe({
        next: (responseMessage) => {
          alert(responseMessage); // Hiện thông báo "Xóa sinh viên thành công!" từ .NET
          this.loadStudents();    // Xóa xong tải lại danh sách mới ngay lập tức
        },
        error: (err) => {
          console.error('Lỗi khi thực hiện xóa:', err);
        }
      });
    }
  }

}
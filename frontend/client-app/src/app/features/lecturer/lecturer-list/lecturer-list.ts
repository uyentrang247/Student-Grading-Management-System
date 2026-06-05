import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 1. Bắt buộc cần cái này cho [(ngModel)]
import { RouterModule } from '@angular/router';
import { LecturerService } from '../../../services/lecturer.service';

@Component({
  selector: 'app-lecturer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // 2. Thêm FormsModule vào đây
  templateUrl: './lecturer-list.html',
  styleUrls: ['./lecturer-list.css']
})
export class LecturerListComponent implements OnInit {
  lecturers: any[] = []; 
  filteredLecturers: any[] = []; 
  searchTerm: string = '';

  constructor(
    private lecturerService: LecturerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Chỉ gọi 1 hàm duy nhất để load dữ liệu
    this.loadLecturers();
  }

  loadLecturers(): void {
    this.lecturerService.getLecturers().subscribe({
      next: (data: any) => {
        this.lecturers = data;
        this.filteredLecturers = data; // Khởi tạo cả 2 mảng cùng lúc
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        alert('Lỗi tải danh sách giảng viên!');
      }
    });
  }

  // Hàm lọc tìm kiếm
  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredLecturers = this.lecturers.filter(l => 
      l.fullName?.toLowerCase().includes(term) || 
      l.email?.toLowerCase().includes(term) // Thường tìm theo email sẽ chuẩn hơn username
    );
  }

  deleteLecturer(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa giảng viên này không?')) {
      this.lecturerService.deleteLecturer(id).subscribe({
        next: (res: any) => { 
          alert(res?.message || 'Xóa giảng viên thành công!'); 
          this.loadLecturers(); 
        },
        error: (err: any) => {
          alert('Có lỗi xảy ra khi xóa: ' + (err.error?.message || 'Vui lòng thử lại sau!'));
        }
      });
    }
  }
}
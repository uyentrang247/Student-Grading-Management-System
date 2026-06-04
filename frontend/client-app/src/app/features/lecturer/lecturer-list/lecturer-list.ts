import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LecturerService } from '../../../services/lecturer.service';

@Component({
  selector: 'app-lecturer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lecturer-list.html',
  styleUrls: ['./lecturer-list.css']
})
export class LecturerListComponent implements OnInit {
  lecturers: any[] = [];

  constructor(
    private lecturerService: LecturerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLecturers();
  }

  loadLecturers(): void {
    this.lecturerService.getLecturers().subscribe({
      next: (data: any) => {
        this.lecturers = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

deleteLecturer(id: number): void {
  if (confirm('Bạn có chắc chắn muốn xóa giảng viên này không?')) {
    this.lecturerService.deleteLecturer(id).subscribe({
      next: (res: any) => { 
        // 🔥 Bồ thêm dòng này vào để hiện thông báo
        // Nếu Backend trả về res có message thì hiện, không thì báo mặc định
        alert(res?.message || 'Xóa giảng viên thành công!'); 
        
        this.loadLecturers(); // Load lại danh sách sau khi xóa
      },
      error: (err: any) => {
        // Nếu xóa lỗi, nó sẽ nhảy vào đây
        console.error(err);
        alert('Có lỗi xảy ra khi xóa: ' + (err.error?.message || 'Vui lòng thử lại sau!'));
      }
    });
  }
}
}
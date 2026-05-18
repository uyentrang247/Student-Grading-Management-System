import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Import 2 trang bạn đã làm (Nhớ kiểm tra tên file có khớp không nhé)
import { SubjectManagementComponent } from './subject-management/subject-management';
import { CourseClassManagementComponent } from './course-class-management/course-class-management';

@Component({
  selector: 'app-root',
  standalone: true,
  // Khai báo các component để Angular cho phép dùng thẻ HTML
  imports: [
    CommonModule, 
    RouterOutlet, 
    SubjectManagementComponent, 
    CourseClassManagementComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'Phần mềm Quản lý Điểm';

  // Biến để điều khiển việc chuyển trang (tab)
  currentTab: string = 'subject'; 

  // Hàm để đổi trang khi nhấn nút
  switchTab(tabName: string) {
    this.currentTab = tabName;
  }
}

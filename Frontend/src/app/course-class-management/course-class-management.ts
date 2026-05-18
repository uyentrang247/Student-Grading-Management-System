import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-class-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-class-management.html',
  styleUrls: ['./course-class-management.css']
})
export class CourseClassManagementComponent {
  isShowingForm: boolean = false;

  // Dữ liệu mẫu để chọn
  subjects = [{ id: 1, name: 'Lập trình C#' }, { id: 2, name: 'Cơ sở dữ liệu' }];
  lecturers = [{ id: 101, name: 'Thầy Nguyễn Văn A' }, { id: 102, name: 'Cô Nguyễn Thị Loan' }];
  semesters = ['Học kỳ 1 - 2023', 'Học kỳ 2 - 2023', 'Học kỳ hè - 2024'];

  // Danh sách lớp đã có
  courseClasses: any[] = [
    { code: 'L01', subject: 'Lập trình C#', lecturer: 'Thầy Phạm Văn Việt', semester: 'Học kỳ 1 - 2023' }
  ];

  newClass = { code: '', subjectId: null, lecturerId: null, semester: '' };

  openForm() { this.isShowingForm = true; }
  closeForm() { this.isShowingForm = false; }

  saveClass() {
    const sub = this.subjects.find(s => s.id == this.newClass.subjectId);
    const lec = this.lecturers.find(l => l.id == this.newClass.lecturerId);

    this.courseClasses.push({
      code: this.newClass.code,
      subject: sub?.name,
      lecturer: lec?.name,
      semester: this.newClass.semester
    });

    alert("✅ Đã tạo lớp học phần thành công!");
    this.closeForm();
  }
}

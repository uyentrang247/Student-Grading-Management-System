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

  isShowingForm = false;

  editingIndex: number | null = null;

  // Dữ liệu mẫu
  subjects = [
    { id: 1, name: 'Lập trình C#' },
    { id: 2, name: 'Cơ sở dữ liệu' }
  ];

  lecturers = [
    { id: 101, name: 'Nguyễn Văn A' },
    { id: 102, name: 'Trần Thị B' }
  ];

  semesters = [
    'HK1 - 2023',
    'HK2 - 2023'
  ];

  // Danh sách lớp học phần
  courseClasses: any[] = [
    {
      code: 'L01',
      subject: 'Lập trình C#',
      lecturer: 'Nguyễn Văn A',
      semester: 'HK1 - 2023'
    }
  ];

  // Form dữ liệu
  newClass: {
    code: string;
    subjectId: number | null;
    lecturerId: number | null;
    semester: string;
  } = {
    code: '',
    subjectId: null,
    lecturerId: null,
    semester: ''
  };

  // Mở form
  openForm() {

    this.newClass = {
      code: '',
      subjectId: null,
      lecturerId: null,
      semester: ''
    };

    this.editingIndex = null;

    this.isShowingForm = true;
  }

  // Đóng form
  closeForm() {
    this.isShowingForm = false;
  }

  // Sửa lớp học phần
  editClass(c: any, index: number) {

    this.newClass = {
      code: c.code,

      subjectId:
        this.subjects.find(s => s.name === c.subject)?.id ?? null,

      lecturerId:
        this.lecturers.find(l => l.name === c.lecturer)?.id ?? null,

      semester: c.semester
    };

    this.editingIndex = index;

    this.isShowingForm = true;
  }

  // Lưu dữ liệu
  saveClass() {

    const sub =
      this.subjects.find(s => s.id == this.newClass.subjectId);

    const lec =
      this.lecturers.find(l => l.id == this.newClass.lecturerId);

    const classData = {
      code: this.newClass.code,
      subject: sub?.name,
      lecturer: lec?.name,
      semester: this.newClass.semester
    };

    // Nếu đang sửa
    if (this.editingIndex !== null) {

      this.courseClasses[this.editingIndex] = classData;

      this.editingIndex = null;

    } else {

      // Thêm mới
      this.courseClasses.push(classData);
    }

    alert('✅ Lưu lớp học phần thành công!');

    this.closeForm();
  }

  // Xóa lớp
  deleteClass(index: number) {

    if (confirm('Bạn có chắc muốn xóa lớp này không?')) {

      this.courseClasses.splice(index, 1);
    }
  }
}
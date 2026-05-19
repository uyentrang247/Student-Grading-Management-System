import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../services/student';
import { Student } from '../../../models/student';
@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-list.html',
  styleUrls: ['./student-list.css']
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);

  students: Student[] = [];         // Mảng lưu dữ liệu gốc
  filteredStudents: Student[] = []; // Mảng dùng để hiển thị (để lọc khi tìm kiếm)
  txtSearch: string = '';           // Biến hứng từ khóa từ ô Tìm kiếm

  ngOnInit(): void {
    this.layDanhSachSinhVien();
  }

  layDanhSachSinhVien(): void {
    this.studentService.getStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = data; 
      },
      error: (err) => {
        console.log('Có lỗi xảy ra: ', err);
      }
    });
  }

  timKiemNhanh( search: string): void {
    const tuKhoa = search.toLowerCase().trim();

    if (tuKhoa === '') {
      this.filteredStudents = this.students;
      return;
    }

    this.filteredStudents = this.students.filter(s => 
      s.studentCode.includes(tuKhoa) || 
     (s.lastName + ' ' + s.firstName).toLowerCase().includes(tuKhoa)
    );
  }
  onAddClick(): void {}
  onEditClick(student: Student): void {}
  xoaSinhVien(student: Student): void {}
  getTenLop(homeroomClassId: number): any {}
}
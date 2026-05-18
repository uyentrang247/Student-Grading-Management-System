import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Student } from '../models/student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  // Mảng dữ liệu giả lập (Mock Data) giống như Database tạm thời
  private mockStudents: Student[] = [
    {
      studentId: 1,
      studentCode: '2052012345',
      lastName: 'Nguyễn Văn',
      firstName: 'An',
      gender: 'Nam',
      dateOfBirth: '2004-05-15',
      homeroomClassId: 101,
      email: 'an.nguyen@gmail.com'
    },
    {
      studentId: 2,
      studentCode: '2052012346',
      lastName: 'Trần Thị',
      firstName: 'Bình',
      gender: 'Nữ',
      dateOfBirth: '2004-11-20',
      homeroomClassId: 101,
      email: 'binh.tran@gmail.com'
    },
    {
      studentId: 3,
      studentCode: '2052012347',
      lastName: 'Lê Hoàng',
      firstName: 'Cường',
      gender: 'Nam',
      dateOfBirth: '2004-02-02',
      homeroomClassId: 102,
      email: 'cuong.le@gmail.com'
    }
  ];

  // Trả về Observable chứa mảng dữ liệu giả để sau này thay bằng API không bị lỗi
  getStudents(): Observable<Student[]> {
    return of(this.mockStudents);
  }
}
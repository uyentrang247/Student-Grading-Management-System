import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StudentResponse, StudentCreateUpdate } from '../models/student';
import { HomeroomClassResponse } from '../models/homeroomclass'; 

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:5059/api/Students'; 

  constructor(private http: HttpClient) { }

  // 1. Gọi API bốc danh sách lớp từ database đổ vào ô Dropdown lọc (Dùng model của bạn)
  getHomeroomClasses(): Observable<HomeroomClassResponse[]> {
    return this.http.get<HomeroomClassResponse[]>(`${this.apiUrl}/classes`);
  }

  // 2. Lấy danh sách sinh viên (Có truyền tham số để Lọc theo lớp và Tìm kiếm)
  getStudents(homeroomClassId?: number, searchTerm?: string): Observable<StudentResponse[]> {
    let params = new HttpParams();
    
    if (homeroomClassId) {
      params = params.set('homeroomClassId', homeroomClassId.toString());
    }
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<StudentResponse[]>(this.apiUrl, { params });
  }

  // 3. Lấy chi tiết 1 sinh viên theo ID (Đã fix logic kết nối bảng ở Backend)
  getStudentById(id: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/${id}`);
  }

  // 4. Thêm mới sinh viên
  createStudent(student: StudentCreateUpdate): Observable<string> {
    return this.http.post(this.apiUrl, student, { responseType: 'text' });
  }

  // 5. Cập nhật thông tin sinh viên
  updateStudent(id: number, student: StudentCreateUpdate): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}`, student, { responseType: 'text' });
  }

  // 6. Xóa sinh viên theo ID
  deleteStudent(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StudentResponse, StudentCreateUpdate } from '../models/student';
import { HomeroomClassResponse } from '../models/homeroomclass'; 

// Tạo thêm interface bọc dữ liệu phân trang ngay tại đây (hoặc import từ file model của bạn)
export interface PaginatedStudentResult {
  totalRecords: number;
  data: StudentResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:5059/api/Students'; 

  constructor(private http: HttpClient) { }

  // 1. Gọi API lấy danh sách lớp đổ vào ô Dropdown lọc
  getHomeroomClasses(): Observable<HomeroomClassResponse[]> {
    return this.http.get<HomeroomClassResponse[]>(`${this.apiUrl}/classes`);
  }

  // 2. Lấy danh sách sinh viên (CẬP NHẬT: Thêm phân trang và đổi kiểu Observable trả về)
  getStudents(
    homeroomClassId?: number, 
    searchTerm?: string, 
    pageNumber: number = 1, 
    pageSize: number = 10
  ): Observable<PaginatedStudentResult> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (homeroomClassId && homeroomClassId > 0) {
      params = params.set('homeroomClassId', homeroomClassId.toString());
    }
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    // API trả về Object phân trang gồm totalRecords và data
    return this.http.get<PaginatedStudentResult>(this.apiUrl, { params });
  }

  // 3. Lấy chi tiết 1 sinh viên theo ID
  getStudentById(id: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/${id}`);
  }

  // 4. Thêm mới sinh viên (CẬP NHẬT: Nhận phản hồi dạng JSON { message: string })
  createStudent(student: StudentCreateUpdate): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, student);
  }

  // 5. Cập nhật thông tin sinh viên (CẬP NHẬT: Nhận phản hồi dạng JSON { message: string })
  updateStudent(id: number, student: StudentCreateUpdate): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, student);
  }

  // 6. Xóa sinh viên theo ID (CẬP NHẬT: Nhận phản hồi dạng JSON { message: string })
  deleteStudent(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
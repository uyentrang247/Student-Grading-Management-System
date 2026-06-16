import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// Sửa đường dẫn import cho khớp chính xác với tên file enrollment.model.ts của bạn
import { CourseClass, ClassDetailsResponse, ServiceResult, ExcelImportResult } from '../models/enrollment';
@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  // Đường dẫn Base API chạy cổng Port .NET của bạn
  private apiUrl = 'http://localhost:5059/api/enrollments'; 

  constructor(private http: HttpClient) { }

  /**
   * Tự động lấy Token từ LocalStorage để làm "thẻ thông hành" gửi lên Backend.
   * Giúp request của bạn vượt qua bộ lọc [Authorize] phía .NET một cách hợp lệ.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * 1. Lấy danh sách lớp học phần
   * - Admin: Nhận về toàn bộ lớp.
   * - Lecturer: Backend tự bóc Token lấy ID để trả về đúng lớp của giảng viên đó.
   */
  getClasses(semesterId?: number): Observable<CourseClass[]> {
    let params = new HttpParams();
    if (semesterId) {
      params = params.set('semesterId', semesterId.toString());
    }
    return this.http.get<CourseClass[]>(this.apiUrl, { 
      headers: this.getAuthHeaders(),
      params: params 
    });
  }

  /**
   * 2. Lấy danh sách học kỳ (Phục vụ bộ lọc combobox/dropdown trên giao diện)
   */
  getSemesters(): Observable<any[]> {
    return this.http.get<any[]>(`${`${this.apiUrl}/semesters`}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * 3. Lấy thông tin chi tiết lớp kèm danh sách sinh viên hiện tại trong lớp đó
   */
  getClassDetails(classId: number): Observable<ClassDetailsResponse> {
    return this.http.get<ClassDetailsResponse>(`${`${this.apiUrl}/${classId}/students`}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * 4. Thêm thủ công một sinh viên vào lớp bằng mã số sinh viên (Dạng URL Params)
   */
  addStudentManual(courseClassId: number, studentCode: string): Observable<ServiceResult> {
    let params = new HttpParams()
      .set('courseClassId', courseClassId.toString())
      .set('studentCode', studentCode);

    return this.http.post<ServiceResult>(`${`${this.apiUrl}/add-student`}`, null, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  /**
   * 5. Import danh sách sinh viên hàng loạt bằng file Excel vật lý (Sử dụng FormData)
   */
  importExcel(courseClassId: number, file: File): Observable<ExcelImportResult> {
    const formData = new FormData();
    formData.append('courseClassId', courseClassId.toString());
    formData.append('excelFile', file, file.name); // Tên 'excelFile' bắt buộc phải khớp với biến IFormFile ở Backend .NET

    return this.http.post<ExcelImportResult>(`${`${this.apiUrl}/import-excel`}`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * 6. Xóa sinh viên khỏi lớp học phần (Sử dụng phương thức DELETE chuẩn RESTful)
   */
  removeStudent(courseClassId: number, studentId: number): Observable<ServiceResult> {
    let params = new HttpParams()
      .set('courseClassId', courseClassId.toString())
      .set('studentId', studentId.toString());

    return this.http.delete<ServiceResult>(`${`${this.apiUrl}/remove-student`}`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }
}
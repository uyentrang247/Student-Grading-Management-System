import { Injectable } from '@angular/core';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StudentResponse, StudentCreateUpdate,ClassLookup,PaginatedStudentResult } from '../models/student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:5059/api/Students';

  constructor(private http: HttpClient) { }
//lay token tu localStorage va them vao header Authorization
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getHomeroomClasses(): Observable<ClassLookup[]> {
    return this.http.get<ClassLookup[]>(
      `${this.apiUrl}/classes`,
      {
        headers: this.getAuthHeaders() //đảm bảo gọi API với token để lấy danh sách lớp
      }
    );
  }

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

    return this.http.get<PaginatedStudentResult>(
      this.apiUrl,
      {
        headers: this.getAuthHeaders(),
        params
      }
    );
  }

  getStudentById(id: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  createStudent(student: StudentCreateUpdate): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      this.apiUrl,
      student,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  updateStudent(
    id: number,
    student: StudentCreateUpdate
  ): Observable<{ message: string }> {

    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${id}`,
      student,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  deleteStudent(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
}
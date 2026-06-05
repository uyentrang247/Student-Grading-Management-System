import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateLecturerDto, Faculty } from '../models/account';

@Injectable({
  providedIn: 'root'
})
export class LecturerService {
  private apiUrl = 'http://localhost:5059/api';

  constructor(private http: HttpClient) { }

  // Hàm dùng chung để lấy Header chứa Token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getFaculties(): Observable<Faculty[]> {
    return this.http.get<Faculty[]>(`${this.apiUrl}/Faculties`);
  }

  getLecturers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Lecturer`);
  }

  getLecturerById(id: number): Observable<any> {
    // Nếu API này cũng cần Admin, hãy thêm { headers: this.getHeaders() } vào tham số thứ 2
    return this.http.get(`${this.apiUrl}/Lecturer/${id}`);
  }

  updateLecturer(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Lecturer/${id}`, data, { headers: this.getHeaders() });
  }

  deleteLecturer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Lecturer/${id}`, { headers: this.getHeaders() });
  }

  createLecturer(lecturer: CreateLecturerDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/Lecturer/create`, lecturer, { headers: this.getHeaders() });
  }
}
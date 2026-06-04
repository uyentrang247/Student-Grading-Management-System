import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateLecturerDto, Faculty } from '../models/account';

@Injectable({
  providedIn: 'root'
})
export class LecturerService {
  private apiUrl = 'http://localhost:5059/api';

  constructor(private http: HttpClient) { }

  getFaculties(): Observable<Faculty[]> {
    return this.http.get<Faculty[]>(`${this.apiUrl}/Faculties`);
  }

  // Lấy danh sách giảng viên
  getLecturers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Lecturer`);
  }

  // Tạo mới giảng viên
  createLecturer(lecturer: CreateLecturerDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/Lecturer/create`, lecturer);
  }
}
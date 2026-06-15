import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Semester {
  semesterId: number;
  term: string;
  academicYear: string;
}

@Injectable({
  providedIn: 'root'
})
export class SemesterService {
  private apiUrl = 'http://localhost:5059/api/Semesters';

  constructor(private http: HttpClient) {}

  getSemesters(): Observable<Semester[]> {
    return this.http.get<Semester[]>(this.apiUrl);
  }

  getSemesterById(id: number): Observable<Semester> {
    return this.http.get<Semester>(`${this.apiUrl}/${id}`);
  }

  createSemester(semester: Partial<Semester>): Observable<Semester> {
    return this.http.post<Semester>(this.apiUrl, semester);
  }

  updateSemester(id: number, semester: Partial<Semester>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, semester);
  }

  deleteSemester(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
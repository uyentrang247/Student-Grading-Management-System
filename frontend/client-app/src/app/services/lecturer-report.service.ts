import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseClass, ClassReport, ApiResponse } from '../models/lecturer-report.model';

@Injectable({
  providedIn: 'root'
})
export class LecturerReportService {
  private apiUrl = 'http://localhost:5059/api/Lecturer';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getMyClasses(): Observable<ApiResponse<CourseClass[]>> {
    return this.http.get<ApiResponse<CourseClass[]>>(
      `${this.apiUrl}/my-classes`,
      { headers: this.getHeaders() }
    );
  }

  getClassReport(courseClassId: number): Observable<ApiResponse<ClassReport>> {
    return this.http.get<ApiResponse<ClassReport>>(
      `${this.apiUrl}/class/${courseClassId}/detailed-report`,
      { headers: this.getHeaders() }
    );
  }
}
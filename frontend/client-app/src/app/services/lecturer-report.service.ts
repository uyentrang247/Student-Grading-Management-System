import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LecturerDashboardData } from '../models/lecturer-report.model';

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

  getDashboard(): Observable<{ success: boolean; data: LecturerDashboardData; message?: string }> {
    return this.http.get<{ success: boolean; data: LecturerDashboardData; message?: string }>(
      `${this.apiUrl}/dashboard`,
      { headers: this.getHeaders() }
    );
  }

  getMyClasses(): Observable<{ success: boolean; data: any[]; message?: string }> {
    return this.http.get<{ success: boolean; data: any[]; message?: string }>(
      `${this.apiUrl}/my-classes`,
      { headers: this.getHeaders() }
    );
  }

  getClassReport(courseClassId: number): Observable<{ success: boolean; data: any; message?: string }> {
    return this.http.get<{ success: boolean; data: any; message?: string }>(
      `${this.apiUrl}/class/${courseClassId}/detailed-report`,
      { headers: this.getHeaders() }
    );
  }
}
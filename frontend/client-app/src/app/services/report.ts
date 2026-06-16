import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:5059/api/Reports';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  exportGradeExcel(courseClassId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-grade-excel/${courseClassId}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  exportFailExcel(courseClassId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-fail-excel/${courseClassId}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }
}
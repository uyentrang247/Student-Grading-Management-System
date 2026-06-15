import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SystemStatistics, ApiResponse } from '../models/admin-statistics.model';

@Injectable({
  providedIn: 'root'
})
export class AdminStatisticsService {
  private apiUrl = 'http://localhost:5059/api/Admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getSystemStatistics(): Observable<ApiResponse<SystemStatistics>> {
    return this.http.get<ApiResponse<SystemStatistics>>(
      `${this.apiUrl}/statistics/overview`,
      { headers: this.getHeaders() }
    );
  }
}
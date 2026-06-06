import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CourseClassSimple {
  courseClassId: number;
  classCode: string;
  subjectName: string;
  semester: string;
  academicYear: string;
}

export interface ClassReport {
  courseClassId: number;
  classCode: string;
  subjectName: string;
  subjectCode: string;
  lecturerName: string;
  semester: string;
  academicYear: string;
  totalStudents: number;
  passCount: number;
  failCount: number;
  passRate: number;
  failRate: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  scoreDistribution: {
    range_0_4: number;
    range_4_5: number;
    range_5_7: number;
    range_7_9: number;
    range_9_10: number;
  };
  gradeLetterDistribution: {
    a: { count: number; percentage: number; range: string };
    b: { count: number; percentage: number; range: string };
    c: { count: number; percentage: number; range: string };
    d: { count: number; percentage: number; range: string };
    f: { count: number; percentage: number; range: string };
  };
}

export interface AdminStatistics {
  overview: {
    totalStudents: number;
    totalLecturers: number;
    totalSubjects: number;
    totalCourseClasses: number;
    totalEnrollments: number;
    overallPassRate: number;
    averageScoreAll: number;
  };
  facultyStatistics: Array<{
    facultyId: number;
    facultyName: string;
    studentCount: number;
    lecturerCount: number;
    courseClassCount: number;
    passRate: number;
    averageScore: number;
  }>;
  topFailSubjects: Array<{
    subjectId: number;
    subjectCode: string;
    subjectName: string;
    credits: number;
    totalStudents: number;
    passCount: number;
    failCount: number;
    passRate: number;
    failRate: number;
    averageScore: number;
  }>;
  semesterStatistics: Array<{
    semesterId: number;
    term: string;
    academicYear: string;
    courseClassCount: number;
    totalStudents: number;
    passRate: number;
    averageScore: number;
  }>;
  overallScoreDistribution: {
    range_0_4: number;
    range_4_5: number;
    range_5_7: number;
    range_7_9: number;
    range_9_10: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:5059/api/Reports';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Lấy danh sách lớp của giảng viên (dropdown)
  getMyCourseClasses(): Observable<CourseClassSimple[]> {
    return this.http.get<CourseClassSimple[]>(`${this.apiUrl}/lecturer/my-classes`, {
      headers: this.getHeaders()
    });
  }

  // Lấy báo cáo 1 lớp
  getClassReport(courseClassId: number): Observable<ClassReport> {
    return this.http.get<ClassReport>(`${this.apiUrl}/lecturer/class-report/${courseClassId}`, {
      headers: this.getHeaders()
    });
  }

  // Lấy thống kê admin
  getAdminStatistics(facultyId?: number, semesterId?: number): Observable<AdminStatistics> {
    let params = new HttpParams();
    if (facultyId) params = params.set('facultyId', facultyId.toString());
    if (semesterId) params = params.set('semesterId', semesterId.toString());
    
    return this.http.get<AdminStatistics>(`${this.apiUrl}/admin/statistics`, {
      headers: this.getHeaders(),
      params
    });
  }
}
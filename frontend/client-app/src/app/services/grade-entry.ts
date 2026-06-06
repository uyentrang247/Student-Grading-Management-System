import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentGrade } from '../models/student-grade';


export interface CourseClassForGrade {
  courseClassId: number;
  classCode: string;
  subjectName: string;
  lecturerName: string;
  semester: string;
  academicYear: string;
}

export interface SaveGradeDto {
  enrollmentId: number;
  courseClassId: number;
  processScore: number | null;
  finalScore: number | null;
}

export interface FailStudent {
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  fullName: string;
  processScore: number | null;
  finalScore: number | null;
  averageScore: number | null;
}

export interface TranscriptResponse {
  courseClass: {
    courseClassId: number;
    classCode: string;
    subjectName: string;
    subjectCode: string;
    credits: number;
    semester: string;
    academicYear: string;
    lecturerName: string;
  };
  students: Array<{
    enrollmentId: number;
    studentId: number;
    studentCode: string;
    fullName: string;
    processScore: number | null;
    finalScore: number | null;
    averageScore: number | null;
    gradeLetter: string;
    gradeScale4: number | null;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class GradeEntryService {
  private apiUrl = 'http://localhost:5059/api/GradeEntry';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getMyCourseClasses(): Observable<CourseClassForGrade[]> {
    return this.http.get<CourseClassForGrade[]>(`${this.apiUrl}/my-course-classes`, {
      headers: this.getHeaders()
    });
  }

  getStudentsByClass(courseClassId: number): Observable<StudentGrade[]> {
    return this.http.get<StudentGrade[]>(`${this.apiUrl}/class/${courseClassId}/students`, {
      headers: this.getHeaders()
    });
  }

  saveGradesBulk(grades: SaveGradeDto[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/save-bulk`, grades, {
      headers: this.getHeaders()
    });
  }

  getFailStudents(courseClassId: number): Observable<FailStudent[]> {
    return this.http.get<FailStudent[]>(`${this.apiUrl}/class/${courseClassId}/fail-students`, {
      headers: this.getHeaders()
    });
  }

  getTranscript(courseClassId: number): Observable<TranscriptResponse> {
    return this.http.get<TranscriptResponse>(`${this.apiUrl}/class/${courseClassId}/transcript`, {
      headers: this.getHeaders()
    });
  }
}
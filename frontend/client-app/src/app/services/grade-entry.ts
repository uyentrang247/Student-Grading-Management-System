import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CourseClassForGrade {
  courseClassId: number;
  classCode: string;
  subjectName: string;
  lecturerName: string;
  semester: string;
  academicYear: string;
}

export interface StudentGrade {
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  fullName: string;
  homeroomClass: string;
  courseClassId: number;
  classCode: string;
  processScore: number | null;
  finalScore: number | null;
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

  getCourseClassesByLecturer(lecturerId: number): Observable<CourseClassForGrade[]> {
    return this.http.get<CourseClassForGrade[]>(`${this.apiUrl}/lecturer/${lecturerId}/course-classes`);
  }

  getStudentsByClass(courseClassId: number): Observable<StudentGrade[]> {
    return this.http.get<StudentGrade[]>(`${this.apiUrl}/class/${courseClassId}/students`);
  }

  saveGradesBulk(grades: SaveGradeDto[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/save-bulk`, grades);
  }

  getFailStudents(courseClassId: number): Observable<FailStudent[]> {
    return this.http.get<FailStudent[]>(`${this.apiUrl}/class/${courseClassId}/fail-students`);
  }

  getTranscript(courseClassId: number): Observable<TranscriptResponse> {
    return this.http.get<TranscriptResponse>(`${this.apiUrl}/class/${courseClassId}/transcript`);
  }
}
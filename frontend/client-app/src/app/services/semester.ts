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
}
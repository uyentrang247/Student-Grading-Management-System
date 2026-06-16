// src/app/models/student.model.ts

export interface StudentResponse {
  studentId: number;
  studentCode: string;
  lastName: string;
  firstName: string;
  gender: boolean;
  dateOfBirth: string;
  homeroomClassId: number;
  homeroomClassName: string;
  email: string;
}

export interface StudentCreateUpdate {
  studentCode: string;
  lastName: string;
  firstName: string;
  gender: string;
  dateOfBirth: string;
  homeroomClassId: number | null;
  email: string;
}

export interface ClassLookup {
  homeroomClassId: number;
  className: string;
}
export interface PaginatedStudentResult {
  totalRecords: number;
  data: StudentResponse[];
}
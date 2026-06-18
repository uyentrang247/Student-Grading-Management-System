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
  processWeight: number; 
    finalWeight: number; 
}
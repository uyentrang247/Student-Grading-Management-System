export interface CourseClass {
  id?: number;

  classCode: string;

  subjectId: number;

  semesterId: number;

  lecturerId?: number | null;

  subjectName?: string;

  lecturerName?: string;

  semester?: string;

  academicYear?: string;

  maxStudents?: number;
}
export interface SemesterStat {
  semesterId: number;
  term: string;
  academicYear: string;
  totalClasses: number;
  totalStudents: number;
  averageScore: number;
  passCount: number;
  failCount: number;
  passRate: number;
}

export interface TopSubject {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  averageScore: number;
  totalStudents: number;
  passCount: number;
  failCount: number;
  failRate: number;
}

export interface FacultyStat {
  facultyId: number;
  facultyCode: string;
  facultyName: string;
  totalLecturers: number;
  totalStudents: number;
  totalHomeroomClasses: number;
}

export interface SystemStatistics {
  totalStudents: number;
  totalLecturers: number;
  totalClasses: number;
  totalSubjects: number;
  totalHomeroomClasses: number;
  totalFaculties: number;
  overallAverageScore: number;
  totalPassCount: number;
  totalFailCount: number;
  overallPassRate: number;
  semesterStatistics: SemesterStat[];
  topSubjectsByScore: TopSubject[];
  topSubjectsByFailRate: TopSubject[];
  facultyStatistics: FacultyStat[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
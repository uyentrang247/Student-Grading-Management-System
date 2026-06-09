export interface CourseClass {
  courseClassId: number;
  classCode: string;
  subjectName: string;
  credits: number;
  semester: string;
  academicYear: string;
}

export interface GradeDistribution {
  grade: string;
  range: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ScoreRange {
  range: string;
  count: number;
  percentage: number;
}

export interface ClassReport {
  courseClassId: number;
  classCode: string;
  subjectName: string;
  credits: number;
  semester: string;
  academicYear: string;
  totalStudents: number;
  passRate: number;
  failRate: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  gradeDistribution: GradeDistribution[];
  scoreRanges: ScoreRange[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
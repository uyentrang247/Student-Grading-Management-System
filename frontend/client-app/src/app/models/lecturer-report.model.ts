// Dashboard overview
export interface DashboardOverview {
  totalClasses: number;
  totalStudents: number;
  totalSubjects: number;
  completedClasses: number;
  incompleteClasses: number;
  completedRate: number;
  totalGradesEntered: number;
  totalGradesExpected: number;
  gradesCompletionRate: number;
}

// Teaching load by subject
export interface SubjectTeachingLoad {
  subjectName: string;
  classCount: number;
  studentCount: number;
}

// Class progress
export interface ClassProgress {
  courseClassId: number;
  classCode: string;
  subjectName: string;
  totalStudents: number;
  gradesEntered: number;
  gradesMissing: number;
  progressPercent: number;
  status: 'completed' | 'incomplete' | 'not_started';
}

// Warning
export interface Warning {
  type: 'missing_grades' | 'incomplete_class' | 'deadline_approaching';
  message: string;
  count: number;
}

// Lecturer Dashboard Data
export interface LecturerDashboardData {
  overview: DashboardOverview;
  teachingLoad: SubjectTeachingLoad[];
  classProgress: ClassProgress[];
  warnings: Warning[];
}

// Api Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}
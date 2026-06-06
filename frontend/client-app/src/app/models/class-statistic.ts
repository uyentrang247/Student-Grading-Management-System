export interface ClassStatistic {
  courseClassId: number;
  classCode: string;
  subjectName: string;

  totalStudents: number;

  passedStudents: number;
  failedStudents: number;

  passRate: number;
  failRate: number;

  averageScore: number;
  highestScore: number;
  lowestScore: number;

  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  gradeF: number;
}
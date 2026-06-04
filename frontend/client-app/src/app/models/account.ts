export interface UserAccount {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  facultyId?: number;
  role: 'Admin' | 'Lecturer';
}

export interface CreateLecturerDto {
  username: string;
  fullName: string;
  email: string;
  facultyId: number;
}

export interface Faculty {
  facultyId: number;
  facultyCode: string;
  facultyName: string;
}
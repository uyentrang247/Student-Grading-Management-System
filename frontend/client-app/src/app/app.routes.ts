import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { HomeComponent } from './features/home/home';
import { StudentListComponent } from './features/student-management/student-list/student-list';
import { StudentEditComponent } from './features/student-management/student-edit/student-edit';
import { StudentCreateComponent } from './features/student-management/student-create/student-create';
import { CourseClassList } from './features/course-classes/course-class-list/course-class-list';
import { CourseClassForm } from './features/course-classes/course-class-form/course-class-form';
import { SubjectList } from './features/subjects/subject-list/subject-list';
import { SubjectForm } from './features/subjects/subject-form/subject-form';
import { GradeEntryComponent } from './features/grade-management/grade-entry/grade-entry';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { CreateLecturerComponent } from './features/lecturer/create-lecturer/create-lecturer';
import { LecturerListComponent } from './features/lecturer/lecturer-list/lecturer-list'; 
import { roleGuard } from './guards/role.guard';
import { EditLecturerComponent } from './features/lecturer/edit-lecturer/edit-lecturer'; 
import { VerifyOtpComponent } from './features/auth/verify-otp/verify-otp';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { ProfileComponent } from './features/profile/profile/profile';
import { FailStudentsListComponent } from './features/grade-management/fail-students-list/fail-students-list';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'admin/lecturers/edit/:id', component: EditLecturerComponent },
  { path: 'forgot-password/verify-otp', component: VerifyOtpComponent },
  { path: 'forgot-password/reset-password', component: ResetPasswordComponent },
// --- QUẢN LÝ ĐÀO TẠO (Admin) ---
  { path: 'admin/lecturers/create', component: CreateLecturerComponent },
  { path: 'admin/lecturers', component: LecturerListComponent },
  { path: 'admin/students', component: StudentListComponent },
  { path: 'subjects', component: SubjectList },
  { path: 'course-classes', component: CourseClassList },

  // --- CHI TIẾT CÁC QUẢN LÝ ---
  { path: 'student/create', component: StudentCreateComponent },
  { path: 'student/edit/:id', component: StudentEditComponent },
  { path: 'subjects/create', component: SubjectForm },
  { path: 'subjects/edit/:id', component: SubjectForm },
  { path: 'course-classes/create', component: CourseClassForm },
  { path: 'course-classes/edit/:id', component: CourseClassForm },

  // --- NGHIỆP VỤ GIẢNG DẠY ---
  { 
    path: 'lecturer/grades', 
    component: GradeEntryComponent,
    canActivate: [roleGuard],
    data: { roles: ['Lecturer'] }
  },
  
   // --- DANH SÁCH SINH VIÊN RỚT ---
  { 
    path: 'lecturer/fail-students', component: FailStudentsListComponent,
    canActivate: [roleGuard],
    data: { roles: ['Lecturer'] }
  }
];
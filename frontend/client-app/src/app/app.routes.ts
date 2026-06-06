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

// ========== IMPORT CÁC COMPONENT MỚI ==========
import { ClassReportComponent } from './features/lecturer/class-report/class-report';
import { GradeExportComponent } from './features/lecturer/grade-export/grade-export';
import { StatisticsComponent } from './features/admin/statistics/statistics';

export const routes: Routes = [
  // === AUTH & COMMON ===
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'forgot-password/verify-otp', component: VerifyOtpComponent },
  { path: 'forgot-password/reset-password', component: ResetPasswordComponent },

  // === QUẢN LÝ GIẢNG VIÊN (ADMIN) ===
  { path: 'admin/lecturers/create', component: CreateLecturerComponent },
  { path: 'admin/lecturers', component: LecturerListComponent },
  { path: 'admin/lecturers/edit/:id', component: EditLecturerComponent },

  // === QUẢN LÝ SINH VIÊN (ADMIN) ===
  { path: 'admin/students', component: StudentListComponent },
  { path: 'student/create', component: StudentCreateComponent },
  { path: 'student/edit/:id', component: StudentEditComponent },

  // === QUẢN LÝ MÔN HỌC (ADMIN) ===
  { path: 'subjects', component: SubjectList },
  { path: 'subjects/create', component: SubjectForm },
  { path: 'subjects/edit/:id', component: SubjectForm },

  // === QUẢN LÝ LỚP HỌC PHẦN (ADMIN) ===
  { path: 'course-classes', component: CourseClassList },
  { path: 'course-classes/create', component: CourseClassForm },
  { path: 'course-classes/edit/:id', component: CourseClassForm },

  // === NGHIỆP VỤ GIẢNG DẠY (LECTURER) ===
  { 
    path: 'lecturer/grades', 
    component: GradeEntryComponent,
    canActivate: [roleGuard],
    data: { roles: ['Lecturer'] }
  },
  
  // === XUẤT BẢNG ĐIỂM (LECTURER) - ĐÃ FIX ===
  { 
    path: 'lecturer/export', 
    component: GradeExportComponent,
    canActivate: [roleGuard],
    data: { roles: ['Lecturer'] },
    runGuardsAndResolvers: 'always'  // ✅ THÊM DÒNG NÀY
  },

  // === BÁO CÁO LỚP PHỤ TRÁCH (LECTURER) - ĐÃ FIX ===
  { 
    path: 'lecturer/reports', 
    component: ClassReportComponent,
    canActivate: [roleGuard],
    data: { roles: ['Lecturer'] },
    runGuardsAndResolvers: 'always'  // ✅ THÊM DÒNG NÀY
  },

  // === BÁO CÁO THỐNG KÊ (ADMIN) - ĐÃ FIX ===
  { 
    path: 'admin/reports', 
    component: StatisticsComponent,
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    runGuardsAndResolvers: 'always'  // ✅ THÊM DÒNG NÀY
  }
];
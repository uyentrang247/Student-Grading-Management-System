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
import { LecturerListComponent } from './features/lecturer/lecturer-list/lecturer-list'; // Thêm dòng này
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

// --- QUẢN LÝ ĐÀO TẠO (Admin) ---
  { path: 'admin/lecturers/create', component: CreateLecturerComponent },
  { path: 'admin/lecturers', component: LecturerListComponent },
  { path: 'admin/students', component: StudentListComponent },
  { path: 'admin/subjects', component: SubjectList },
  { path: 'admin/course-classes', component: CourseClassList },

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
  }
];
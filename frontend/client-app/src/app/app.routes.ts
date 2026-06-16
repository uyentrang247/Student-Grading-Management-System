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
import { ClassListComponent } from './features/student-management/class-list/class-list';
import { ClassDetailComponent } from './features/student-management/class-detail/class-detail';
import { ExportGradeComponent } from './features/report/export-grade/export-grade';
import { LecturerReport } from './features/lecturer/lecturer-report/lecturer-report';
import { AdminStatistics } from './features/admin/admin-statistics/admin-statistics';

export const routes: Routes = [
{
path: '',
redirectTo: 'login',
pathMatch: 'full'
},
{
path: 'login',
component: LoginComponent
},
{
path: 'home',
component: HomeComponent
},

// --- SINH VIÊN ---
{
path: 'student',
component: StudentListComponent
},
{
path: 'student/edit/:id',
component: StudentEditComponent
},
{
path: 'student/create',
component: StudentCreateComponent
},

// --- LỚP HỌC PHẦN ---
{
path: 'course-classes',
component: CourseClassList
},
{
path: 'course-classes/create',
component: CourseClassForm
},
{
path: 'course-classes/edit/:id',
component: CourseClassForm
},

// --- MÔN HỌC ---
{
path: 'subjects',
component: SubjectList
},
{
path: 'subjects/create',
component: SubjectForm
},
{
path: 'subjects/edit/:id',
component: SubjectForm
},

// --- ĐIỂM ---
{
path: 'grades',
component: GradeEntryComponent
},

// --- QUÊN MẬT KHẨU ---
{
path: 'forgot-password',
component: ForgotPasswordComponent
},
{
path: 'verify-otp',
component: VerifyOtpComponent
},
{
path: 'reset-password',
component: ResetPasswordComponent
},

// --- HỒ SƠ ---
{
path: 'profile',
component: ProfileComponent
},

// --- QUẢN LÝ GIẢNG VIÊN ---
{
path: 'lecturers',
component: LecturerListComponent
},
{
path: 'lecturers/create',
component: CreateLecturerComponent
},
{
path: 'lecturers/edit/:id',
component: EditLecturerComponent
},

// --- NGHIỆP VỤ GIẢNG DẠY ---
{
path: 'lecturer/grades',
component: GradeEntryComponent,
canActivate: [roleGuard],
data: { roles: ['Lecturer'] }
},

// --- DANH SÁCH SINH VIÊN RỚT ---
{
path: 'lecturer/fail-students',
component: FailStudentsListComponent,
canActivate: [roleGuard],
data: { roles: ['Lecturer'] }
},

// --- XEM LỚP PHỤ TRÁCH ---
{
path: 'lecturer/classes',
component: ClassListComponent,
canActivate: [roleGuard],
data: { roles: ['Lecturer'] }
},
{
path: 'lecturer/classes/:id',
component: ClassDetailComponent,
canActivate: [roleGuard],
data: { roles: ['Lecturer'] }
},

// --- XUẤT BẢNG ĐIỂM ---
{
path: 'lecturer/export-grade',
component: ExportGradeComponent,
canActivate: [roleGuard],
data: { roles: ['Lecturer'] }
},

// --- BÁO CÁO GIẢNG VIÊN ---
{
path: 'lecturer/reports',
component: LecturerReport,
canActivate: [roleGuard],
data: { roles: ['Lecturer'] }
},

// --- BÁO CÁO ADMIN ---
{
path: 'admin/reports',
component: AdminStatistics,
canActivate: [roleGuard],
data: { roles: ['Admin'] }
}
];

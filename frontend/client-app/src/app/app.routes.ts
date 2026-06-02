import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { HomeComponent } from './features/home/home';
import { StudentListComponent } from './features/student-management/student-list/student-list';
import { CourseClassList } from './features/course-classes/course-class-list/course-class-list';
import { CourseClassForm } from './features/course-classes/course-class-form/course-class-form';
import { SubjectList } from './features/subjects/subject-list/subject-list';
import { SubjectForm } from './features/subjects/subject-form/subject-form';
import { GradeEntryComponent } from './features/grade-management/grade-entry/grade-entry';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
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
  {
    path: 'student',
    component: StudentListComponent
  },
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
  {
    path: 'grades',
    component: GradeEntryComponent
  },
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent 
  }
];
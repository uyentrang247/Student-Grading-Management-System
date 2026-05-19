import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { HomeComponent } from './features/home/home';

import { SubjectManagementComponent } from './features/subject-management/subject-management';
import { CourseClassManagementComponent } from './features/course-class-management/course-class-management';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  
  { path: 'subjects', component: SubjectManagementComponent },
  { path: 'course-classes', component: CourseClassManagementComponent },
];

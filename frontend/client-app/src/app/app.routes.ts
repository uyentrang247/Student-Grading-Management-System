import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { HomeComponent } from './features/home/home';
import { StudentListComponent } from './features/student-management/student-list/student-list';
import { CourseClassList } from './features/course-classes/course-class-list/course-class-list';
import { CourseClassForm } from './features/course-classes/course-class-form/course-class-form';
import { SubjectList } from './features/subjects/subject-list/subject-list';
import { SubjectForm } from './features/subjects/subject-form/subject-form';

export const routes: Routes = [
  
  {
    path: '',
    component: HomeComponent
  },

  {
    path: 'login',
    component: LoginComponent
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
  }
];
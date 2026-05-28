import { Routes } from '@angular/router';
import { SubjectForm } from './features/subjects/pages/subject-form/subject-form';
import { SubjectList } from './features/subjects/pages/subject-list/subject-list';
import { LoginComponent } from './features/auth/login/login';
import { HomeComponent } from './features/home/home';
import { StudentListComponent } from './features/student-management/student-list/student-list';
import { CourseClassList } from './features/course-classes/pages/course-class-list/course-class-list';
import { CourseClassForm } from './features/course-classes/pages/course-class-form/course-class-form';
export const routes: Routes = [

  {
    path: '',
    component: HomeComponent
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
}

];
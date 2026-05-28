import { Routes } from '@angular/router';
import { SubjectForm } from './features/subjects/pages/subject-form/subject-form';
import { SubjectList } from './features/subjects/pages/subject-list/subject-list';
import { LoginComponent } from './features/auth/login/login';
import { HomeComponent } from './features/home/home';
import { StudentListComponent } from './features/student-management/student-list/student-list';
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },

  {
  path: 'subjects/create',
  component: SubjectForm
},

  {
  path: 'subjects',
  component: SubjectList
},

  {
    path: 'login',
    component: LoginComponent
  },
  {
    path:'student',
    component:StudentListComponent
  }
];
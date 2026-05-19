import { Routes } from '@angular/router';

import { GradeList } from './pages/grade/grade-list/grade-list';
import { RetakeList } from './pages/grade/retake-list/retake-list';
import { Statistics } from './pages/grade/statistics/statistics';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'grades',
    pathMatch: 'full'
  },

  {
    path: 'grades',
    component: GradeList
  },

  {
    path: 'retake',
    component: RetakeList
  },

  {
    path: 'statistics',
    component: Statistics
  }

];
import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'hero/add',
        loadComponent: () =>
          import('./dashboard/hero/add/add.component').then(
            (m) => m.AddComponent
          ),
      },
      {
        path: 'hero/list',
        loadComponent: () =>
          import('./dashboard/hero/list/list.component').then(
            (m) => m.ListComponent
          ),
      },
      {
        path: 'hero/edit/:id',
        loadComponent: () =>
          import('./dashboard/hero/edit/edit.component').then(
            (m) => m.EditComponent
          ),
      },
      {
        path: '',
        redirectTo: 'hero/list',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

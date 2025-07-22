import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddComponent } from './hero/add/add.component';
import { EditComponent } from './hero/edit/edit.component';
import { ListComponent } from './hero/list/list.component';

const routes: Routes = [
  { path: 'add', component: AddComponent },
  { path: 'hero/edit/:id', component: EditComponent },
  { path: 'list', component: ListComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}

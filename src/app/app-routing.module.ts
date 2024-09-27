import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskListComponent } from './task/components/task-list/task-list.component';
import { TaskManagerComponent } from './task/components/task-manager/task-manager.component';  // Importa TaskManagerComponent

const routes: Routes = [
  { path: 'task-list', component: TaskListComponent },
  { path: 'task-manager', component: TaskManagerComponent },
  { path: '', redirectTo: '/task-manager', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

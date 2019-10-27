import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefinitionComponent } from './definition/definition.component';
import { StatusComponent} from './status/status.component';
import { ResultsComponent } from './results/results.component';
import { LoginComponent } from './login/login.component';
import { DataManagementComponent } from './data-management/data-management.component';
import { ToolsManagementComponent } from './tools-management/tools-management.component';
import { TasksManagementComponent } from './tasks-management/tasks-management.component';
import { GroupsManagementComponent } from './groups-management/groups-management.component';
import { FoldersManagementComponent } from './folders-management/folders-management.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'definition', component: DefinitionComponent },
  { path: 'status', component: StatusComponent },
  { path: 'results', component: ResultsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'datamanager', component: DataManagementComponent },
  { path: 'toolsmanager', component: ToolsManagementComponent },
  { path: 'tasksmanager', component: TasksManagementComponent },
  { path: 'groupsmanager', component: GroupsManagementComponent },
  { path: 'foldersmanager', component: FoldersManagementComponent }
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ],
  declarations: []
})
export class AppRoutingModule { }

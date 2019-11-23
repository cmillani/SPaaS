import { RouterModule, Routes, CanActivate } from '@angular/router';
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
import {
  AuthGuardService as AuthGuard
} from './spass.authService';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'definition', component: DefinitionComponent, canActivate: [AuthGuard]  },
  { path: 'status', component: StatusComponent, canActivate: [AuthGuard]  },
  { path: 'results', component: ResultsComponent, canActivate: [AuthGuard]  },
  { path: 'datamanager', component: DataManagementComponent, canActivate: [AuthGuard]  },
  { path: 'toolsmanager', component: ToolsManagementComponent, canActivate: [AuthGuard]  },
  { path: 'tasksmanager', component: TasksManagementComponent, canActivate: [AuthGuard]  },
  { path: 'groupsmanager', component: GroupsManagementComponent, canActivate: [AuthGuard]  },
  { path: 'foldersmanager', component: FoldersManagementComponent, canActivate: [AuthGuard]  },
  { path: '**', redirectTo: '/login' }
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

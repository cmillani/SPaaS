import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpassService } from '../spass.service';

@Component({
  selector: 'app-tasks-management',
  templateUrl: './tasks-management.component.html',
  styleUrls: ['./tasks-management.component.css']
})
export class TasksManagementComponent implements OnInit {
  loggedMail: string;
  dataNames: any;
  toolNames: any;
  selectedToolId: number;
  selectedDataId: number;
  parameters: any;
  submissionDescription: any;
  selectedParameters: any;

  constructor(private router: Router, private apiService: SpassService) { }

  ngOnInit() {
    this.selectedParameters = {};
    this.loggedMail = localStorage.getItem('loggedMail');
    if (!this.loggedMail) {
      this.router.navigate(['/', 'login']);
    }

    this.apiService.getBlobFiles().subscribe(response => {
      this.dataNames = response;
    });

    this.apiService.getTools().subscribe(response => {
      this.toolNames = response;
    });
  }

  submitTask() {
    this.submissionDescription = {};
    this.submissionDescription['tool'] = this.selectedToolId;
    this.submissionDescription['data'] = this.selectedDataId;
    this.submissionDescription['args'] = this.selectedParameters;
    this.apiService.submitTask(this.submissionDescription).subscribe(response => {
      console.log(response);
    });
  }

  loadParameters() {
    this.apiService.loadParameters(this.selectedToolId)
    .subscribe(response => {
      this.parameters = response;
    });
  }

}

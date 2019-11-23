import { Component, OnInit } from '@angular/core';
import { SpassService } from '../spass.service';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-tools-management',
  templateUrl: './tools-management.component.html',
  styleUrls: ['./tools-management.component.css']
})
export class ToolsManagementComponent implements OnInit {
  fileToUpload: File;
  nameOfFile: string;
  fileNames: any;
  jobParams: string;

  @ViewChild('fileInput') fileInput;

  constructor(private apiService: SpassService, private router: Router) { }

  ngOnInit() {
    this.fileToUpload = null;
    this.getTools();
  }

  getTools() {
    this.apiService.getTools().subscribe(response => {
      this.fileNames = response;
    });
  }

  createTool() {
    this.apiService.uploadTool(this.fileToUpload, this.nameOfFile, this.jobParams)
    .subscribe(response => {
      this.getTools();
      this.jobParams = "";
      this.nameOfFile = "";
      this.fileInput.nativeElement.value = "";
      console.log(response);
    });
  }

  onFileChange(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  downloadTool(name: any) {
    this.apiService.downloadTool(name)
    .subscribe(response => {
      this.getTools();
      console.log(response);
    });
  }

  deleteTool(name: any) {
    this.apiService.deleteTool(name)
    .subscribe(response => {
      this.getTools();
      console.log(response);
    });
  }

}

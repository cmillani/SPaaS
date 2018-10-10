import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SpassService } from '../spass.service';

@Component({
  selector: 'app-data-management',
  templateUrl: './data-management.component.html',
  styleUrls: ['./data-management.component.css']
})
export class DataManagementComponent implements OnInit {
  loggedMail: string;
  fileToUpload: File;
  nameOfFile: string;

  constructor(private apiService: SpassService) { }

  ngOnInit() {
    this.loggedMail = localStorage.getItem('loggedMail');
    this.fileToUpload = null;
  }

  onFileChange(files: FileList) {
    this.fileToUpload = files.item(0);
    this.apiService.uploadData(this.fileToUpload, this.nameOfFile)
    .subscribe(response => {
      console.log(response);
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SpassService } from '../spass.service';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-data-management',
  templateUrl: './data-management.component.html',
  styleUrls: ['./data-management.component.css']
})
export class DataManagementComponent implements OnInit {
  loggedMail: string;
  fileToUpload: File;
  nameOfFile: string;
  fileNames: any;

  @ViewChild('fileInput') fileInput;

  constructor(private apiService: SpassService, private router: Router) { }

  ngOnInit() {
    this.fileToUpload = null;
    this.loadFiles();
  }

  createData() {
    this.apiService.uploadData(this.fileToUpload, this.nameOfFile)
    .subscribe(response => {
      this.loadFiles();
      console.log(response);
      this.nameOfFile = "";
      this.fileInput.nativeElement.value = "";
    });
  }

  loadFiles() {
    this.apiService.getBlobFiles().subscribe(response => {
      this.fileNames = response;
    });
  }

  onFileChange(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  downloadData(name: any) {
    this.apiService.downloadData(name).subscribe( response => {
      console.log(response)
    })
  }

  deleteData(name: any) {
    this.apiService.deleteData(name)
    .subscribe(response => {
      this.loadFiles();
      console.log(response);
    });
  }

}

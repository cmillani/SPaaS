import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-folders-management',
  templateUrl: './folders-management.component.html',
  styleUrls: ['./folders-management.component.css']
})
export class FoldersManagementComponent implements OnInit {

  constructor() { }

  nameOfNewFolder: string
  folders: any

  ngOnInit() {
    this.folders = [{name: "Test folder"}]
  }

  deleteFolder(group: any) {

  }

  createFolder() {
    this.folders.push({name: this.nameOfNewFolder})
    this.nameOfNewFolder = ""
  }

}

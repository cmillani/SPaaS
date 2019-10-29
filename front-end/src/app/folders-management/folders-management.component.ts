import { Component, OnInit } from '@angular/core';
import { SpassService } from '../spass.service';

@Component({
  selector: 'app-folders-management',
  templateUrl: './folders-management.component.html',
  styleUrls: ['./folders-management.component.css']
})
export class FoldersManagementComponent implements OnInit {

  constructor(private apiService: SpassService) { }

  nameOfNewFolder: string
  folders: any

  ngOnInit() {
    this.loadFolders()
  }

  loadFolders() {
    this.apiService.listFolders().subscribe( response => {
      this.folders = response
    })
  }

  deleteFolder(folder: any) {
    this.apiService.deleteFolder(folder.id).subscribe(response => {
      console.log(response)
      this.loadFolders()
    })
  }

  createFolder() {
    this.apiService.createFolder(this.nameOfNewFolder).subscribe(response => {
      this.nameOfNewFolder = ""
      this.loadFolders()
    });
  }

}

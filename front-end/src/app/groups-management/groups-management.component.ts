import { Component, OnInit } from '@angular/core';
import { SpassService } from '../spass.service';

@Component({
  selector: 'app-groups-management',
  templateUrl: './groups-management.component.html',
  styleUrls: ['./groups-management.component.css']
})
export class GroupsManagementComponent implements OnInit {

  nameOfNewGroup: string
  groups: any

  constructor(private apiService: SpassService) { }

  ngOnInit() {
    this.loadGroups()
  }

  loadGroups() {
    this.apiService.listGroups().subscribe( response => {
      this.groups = response
    })
  }

  deleteGroup(group: any) {
    this.apiService.deleteGroup(group.id).subscribe(response => {
      console.log(response)
      this.loadGroups()
    })
  }

  createGroup() {
    this.apiService.createGroup(this.nameOfNewGroup).subscribe(response => {
      this.nameOfNewGroup = ""
      this.loadGroups()
    });
  }

}

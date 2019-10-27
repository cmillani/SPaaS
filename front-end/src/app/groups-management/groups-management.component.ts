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

  constructor(private apiservice: SpassService) { }

  ngOnInit() {
    this.groups = [{name: "Test group"}]
  }

  deleteGroup(group: any) {

  }

  createGroup() {
    this.groups.push({name: this.nameOfNewGroup})
    this.nameOfNewGroup = ""
  }

}

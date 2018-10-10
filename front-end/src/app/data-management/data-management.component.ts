import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-management',
  templateUrl: './data-management.component.html',
  styleUrls: ['./data-management.component.css']
})
export class DataManagementComponent implements OnInit {
  loggedMail: string;

  constructor() { }

  ngOnInit() {
    this.loggedMail = localStorage.getItem('loggedMail');
  }

}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-accountcreation',
  templateUrl: './accountcreation.component.html',
  styleUrls: ['./accountcreation.component.css']
})
export class AccountcreationComponent implements OnInit {
  newEmail: string;
  newPass: string;
  newConfirmedPass: string;
  finalObject: object;
  alertMessage: string;

  constructor() { }

  ngOnInit() {
    this.finalObject = {};
    this.alertMessage = '';
  }

  onSubmit() {
    if (this.newPass === this.newConfirmedPass) {
      this.alertMessage = ' ';
    } else {
      this.alertMessage = 'The two passwords you are trying to use are different';
    }

    this.finalObject['email'] = this.newEmail;
    this.finalObject['password'] = this.newPass;
  }
}

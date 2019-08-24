import { Component, OnInit } from '@angular/core';
import { SpassService } from '../spass.service';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css']
})
export class SideMenuComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit() { }
}
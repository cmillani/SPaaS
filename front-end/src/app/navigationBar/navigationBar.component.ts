import { Component, OnInit } from '@angular/core';
import { SpassService } from '../spass.service';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-navigationBar',
  templateUrl: './navigationBar.component.html',
  styleUrls: ['./navigationBar.component.css'],
})
export class NavigationBarComponent implements OnInit {
    loggedMail: string;

    constructor(private router: Router, public oidcSecurityService: OidcSecurityService) { }

    ngOnInit() {
        this.loggedMail = localStorage.getItem('loggedMail');
    }

    logout() {
        this.oidcSecurityService.logoff();
    }
}

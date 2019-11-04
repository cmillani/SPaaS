import { Subscription } from 'rxjs';
import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root',
})
export class SpassAuthService {

  isAuthorizedSubscription: Subscription;
  loggedMail: string;
  isAuthorized: boolean = true;

  constructor(private router: Router, public oidcSecurityService: OidcSecurityService) { }

  ngOnInit() {
    this.isAuthorizedSubscription = this.oidcSecurityService.getIsAuthorized().subscribe((isAuthorized: boolean) => {
      this.isAuthorized = isAuthorized;
    })
  }

  public isAuthenticated(): boolean {
    return this.isAuthorized;
  }

  ngOnDestroy() {
    this.isAuthorizedSubscription.unsubscribe();
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(public auth: SpassAuthService, public router: Router) {}

  canActivate(): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}

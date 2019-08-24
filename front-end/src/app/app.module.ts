import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { DefinitionComponent } from './definition/definition.component';
import { StatusComponent } from './status/status.component';
import { ResultsComponent } from './results/results.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { AccountcreationComponent } from './accountcreation/accountcreation.component';
import { SpassService } from './spass.service';
import { DataManagementComponent } from './data-management/data-management.component';
import { ToolsManagementComponent } from './tools-management/tools-management.component';
import { TasksManagementComponent } from './tasks-management/tasks-management.component';
import { NavigationBarComponent } from './navigationBar/navigationBar.component'
import { AuthModule, 
         ConfigResult, 
         OidcConfigService, 
         OidcSecurityService, 
         OpenIdConfiguration } from 'angular-auth-oidc-client';
 
export function loadConfig(oidcConfigService: OidcConfigService) {
  return () => 
    oidcConfigService.load_using_stsServer(
      'http://localhost:3000'
    );
}

@NgModule({
  declarations: [
    NavigationBarComponent,
    AppComponent,
    DefinitionComponent,
    StatusComponent,
    ResultsComponent,
    LoginComponent,
    AccountcreationComponent,
    DataManagementComponent,
    ToolsManagementComponent,
    TasksManagementComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    HttpModule,
    AuthModule.forRoot(),
  ],
  providers: [
    OidcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      deps: [OidcConfigService],
      multi: true
    },
    SpassService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(private oidcSecurityService: OidcSecurityService, private oidcConfigService: OidcConfigService) {
        this.oidcConfigService.onConfigurationLoaded.subscribe((configResult: ConfigResult) => {
          const config: OpenIdConfiguration = {
            stsServer: configResult.customConfig.stsServer,
            redirect_url: 'http://localhost:4200/login',
            client_id: 'spaas',
            post_logout_redirect_uri: 'http://localhost:4200',
            start_checksession: true,
            post_login_route: "/toolsmanager",
            scope: 'openid profile email',
            response_type: 'code',
            // silent_renew: true,
            // silent_renew_url: 'https://localhost:4200/silent-renew.html',
            log_console_debug_active: true,
            forbidden_route: "/forbidden",
            unauthorized_route: "/unauthorized",
            log_console_warning_active: true,
            max_id_token_iat_offset_allowed_in_seconds: 10
          }; 
          this.oidcSecurityService.setupModule(config, configResult.authWellknownEndpoints);
        });
    }
}

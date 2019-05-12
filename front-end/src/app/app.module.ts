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
import {
    AuthModule,
    AuthWellKnownEndpoints,
    OidcConfigService,
    OidcSecurityService,
    OpenIDImplicitFlowConfiguration,
} from 'angular-auth-oidc-client';

const oidc_configuration = '../assets/auth.clientConfiguration.json';
// if your config is on server side
// const oidc_configuration = ${window.location.origin}/api/ClientAppSettings
 
 
export function loadConfig(oidcConfigService: OidcConfigService) {
  return () => 
    oidcConfigService.load_using_custom_stsServer(
      'http://localhost:3000/.well-known/openid-configuration'
    );
}

@NgModule({
  declarations: [
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
        this.oidcConfigService.onConfigurationLoaded.subscribe(() => {
          const oidcFlowConfig = new OpenIDImplicitFlowConfiguration();
          //merge configuration loaded from assets/auth.clientConfiguration.json
          Object.assign(oidcFlowConfig, this.oidcConfigService.clientConfiguration);
          this.oidcSecurityService.setupModule(oidcFlowConfig, this.oidcConfigService.wellKnownEndpoints);
        });
    }
}

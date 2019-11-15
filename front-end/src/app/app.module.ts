import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { environment } from '../environments/environment';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatRadioModule, MatIconModule, MatDividerModule, MatTabsModule } from '@angular/material';

import { AppComponent } from './app.component';
import { DefinitionComponent } from './definition/definition.component';
import { StatusComponent } from './status/status.component';
import { ResultsComponent } from './results/results.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { SpassService } from './spass.service';
import { DataManagementComponent } from './data-management/data-management.component';
import { ToolsManagementComponent } from './tools-management/tools-management.component';
import { TasksManagementComponent } from './tasks-management/tasks-management.component';
import { NavigationBarComponent } from './navigationBar/navigationBar.component'
import { SideMenuComponent } from './sidemenu/sidemenu.component'
import { ShareModal } from './share-modal/share-modal.component'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthModule,
         ConfigResult,
         OidcConfigService,
         OidcSecurityService,
         OpenIdConfiguration } from 'angular-auth-oidc-client';
import { GroupsManagementComponent } from './groups-management/groups-management.component';
import { FoldersManagementComponent } from './folders-management/folders-management.component';

export function loadConfig(oidcConfigService: OidcConfigService) {
  return () =>
    oidcConfigService.load_using_stsServer(
      environment.authApiPath
    );
}

@NgModule({
  declarations: [
    SideMenuComponent,
    ShareModal,
    NavigationBarComponent,
    AppComponent,
    DefinitionComponent,
    StatusComponent,
    ResultsComponent,
    LoginComponent,
    DataManagementComponent,
    ToolsManagementComponent,
    TasksManagementComponent,
    GroupsManagementComponent,
    FoldersManagementComponent
  ],
  imports: [
    MatTabsModule,
    MatDividerModule,
    MatRadioModule,
    MatIconModule,
    BrowserAnimationsModule,
    NgbModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    HttpModule,
    AuthModule.forRoot()
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
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
  constructor(private oidcSecurityService: OidcSecurityService, private oidcConfigService: OidcConfigService) {
        this.oidcConfigService.onConfigurationLoaded.subscribe((configResult: ConfigResult) => {
          const config: OpenIdConfiguration = {
            stsServer: configResult.customConfig.stsServer,
            redirect_url: environment.frontend + '/login',
            client_id: 'spaas',
            post_logout_redirect_uri: environment.frontend,
            start_checksession: true,
            post_login_route: "/toolsmanager",
            scope: 'openid profile email',
            response_type: 'code',
            silent_renew: true,
            silent_renew_url: environment.frontend + '/silent-renew.html',
            log_console_debug_active: !environment.production,
            forbidden_route: "/forbidden",
            unauthorized_route: "/unauthorized",
            log_console_warning_active: true,
            max_id_token_iat_offset_allowed_in_seconds: 10
          };
          console.log(config)
          console.log(configResult.authWellknownEndpoints)
          this.oidcSecurityService.setupModule(config, configResult.authWellknownEndpoints);
        });
    }
}

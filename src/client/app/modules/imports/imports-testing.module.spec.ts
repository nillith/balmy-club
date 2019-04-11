import {NgModule} from '@angular/core';
import {MatDialog, MatDialogModule, MatDialogRef} from "@angular/material";
import {JwtModule} from "@auth0/angular-jwt";
import {getAccessToken} from "../../../utils/auth";
import {environment} from "../../../environments/environment";
import {commonExternalModules} from "./module-list";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";

@NgModule({
  imports: [
    MatDialogModule
  ],
  providers: [
    // workaround: why I can't inject MatDialogRef in the unit test?
    // {
    //   provide: MatDialogRef,
    //   useValue: {
    //     updatePosition() {
    //     }
    //   }
    // },
  ],
})
export class MyTestingHelperModule {
}

const exportedModules = [
  NoopAnimationsModule,
  RouterTestingModule,
  HttpClientTestingModule,
  MyTestingHelperModule,
  ...commonExternalModules
];

@NgModule({
  imports: [
    ...exportedModules,
    JwtModule.forRoot({
      config: {
        tokenGetter: getAccessToken,
        whitelistedDomains: environment.jwtModule.whitelistedDomains,
        blacklistedRoutes: environment.jwtModule.blacklistedRoutes
      }
    })
  ],
  exports: exportedModules,
  providers: [
    {provide: MatDialogRef, useValue: {}},
  ],
})
export class ImportsTestingModule {
}

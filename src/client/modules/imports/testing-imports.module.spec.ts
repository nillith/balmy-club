import {NgModule} from '@angular/core';
import {sharedTestingImports} from "./imports.config";
import {MatDialogRef} from "@angular/material";
import {JwtModule} from "@auth0/angular-jwt";
import {getAccessToken} from "../../utils/auth";
import {environment} from "../../environments/environment";

@NgModule({
  imports: [
    ...sharedTestingImports,
    JwtModule.forRoot({
      config: {
        tokenGetter: getAccessToken,
        whitelistedDomains: environment.jwtModule.whitelistedDomains,
        blacklistedRoutes: environment.jwtModule.blacklistedRoutes
      }
    })
  ],
  exports: [...sharedTestingImports],
  providers: [
    {provide: MatDialogRef, useValue: {}},
  ],
})
export class TestingImportsModule {
}

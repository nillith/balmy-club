import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {RouterModule} from "@angular/router";
import {LoginComponent} from './pages/login/login.component';
import {SignUpComponent} from './pages/sign-up/sign-up.component';
import {HttpClientModule} from "@angular/common/http";
import {JwtModule} from '@auth0/angular-jwt';
import {environment} from "../environments/environment";
import {getAccessToken} from "../utils/auth";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { MatImportModule } from './mat-import.module';
import {MainNavComponent} from "./components/main-nav/main-nav.component";


@NgModule({
  declarations: [
    MainNavComponent,
    AppComponent,
    LoginComponent,
    SignUpComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: getAccessToken,
        whitelistedDomains: environment.jwtModule.whitelistedDomains,
        blacklistedRoutes: environment.jwtModule.blacklistedRoutes
      }
    }),
    MatImportModule
  ],
  providers: [
    // uncomment this for "hash-bang" routing
    // { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

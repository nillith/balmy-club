import {NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatTableModule,
  MatToolbarModule
} from "@angular/material";
import {FlexLayoutModule} from "@angular/flex-layout";
import {LayoutModule} from "@angular/cdk/layout";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientModule} from "@angular/common/http";
import {RouterModule} from "@angular/router";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {BrowserModule} from "@angular/platform-browser";
import {MainNavViewComponent} from './main-nav-view/main-nav-view.component';
import {LoginViewComponent} from './login-view/login-view.component';
import {FormsModule} from "@angular/forms";
import {HomeComponent} from "../pages/home/home.component";

const modules = [
  BrowserModule,
  BrowserAnimationsModule,
  CommonModule,
  RouterModule,
  HttpClientModule,
  CommonModule,
  LayoutModule,
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule,
  RouterTestingModule,
  MatButtonModule,
  MatCheckboxModule,
  FlexLayoutModule,
  MatCardModule,
  MatInputModule,
  MatSidenavModule,
  FormsModule,
  MatDialogModule,
  MatTableModule,
  MatMenuModule,
  MatProgressSpinnerModule,
];

const components = [
  MainNavViewComponent,
  LoginViewComponent,
];

@NgModule({
  declarations: [...components],
  imports: [...modules],
  exports: [...modules, ...components],
})
export class SharedModule {
  constructor(@Optional() @SkipSelf() parentModule: SharedModule) {
    if (parentModule) {
      throw new Error(
        'SharedModule is already loaded. Import it in the AppModule only');
    }
  }
}

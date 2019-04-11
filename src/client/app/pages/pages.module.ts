import {NgModule} from '@angular/core';
import {LoginComponent} from "./login/login.component";
import {SignUpComponent} from "./sign-up/sign-up.component";
import {ImportsModule} from "../../modules/imports/imports.module";
import {RouterModule, Routes} from "@angular/router";
import {DashboardComponent} from './dashboard/dashboard.component';
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'sign-up', component: SignUpComponent},
  {path: 'dashboard', component: DashboardComponent},
];

@NgModule({
  declarations: [
    HomeComponent,
    LoginComponent,
    SignUpComponent,
    DashboardComponent
  ],
  imports: [
    ImportsModule,
    RouterModule.forChild(routes),
  ]
})
export class PagesModule {
}

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {DashboardComponent} from './dashboard/dashboard.component';
import {HomeComponent} from "./home/home.component";
import {ProjectModulesImportsModule} from "../modules/imports/project-modules-imports.module";
import { UserPageComponent } from './u/user-page.component';

const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent},
];

@NgModule({
  declarations: [
    HomeComponent,
    DashboardComponent,
    UserPageComponent
  ],
  imports: [
    ProjectModulesImportsModule,
    RouterModule.forChild(routes),
  ]
})
export class PagesModule {
}

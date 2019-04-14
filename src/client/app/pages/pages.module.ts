import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {DashboardComponent} from './dashboard/dashboard.component';
import {HomeComponent} from "./home/home.component";
import {ProjectModulesImportsModule} from "../modules/imports/project-modules-imports.module";
import { UserPageComponent } from './u/user-page.component';
import { CirclesComponent } from './circles/circles.component';
import { SettingComponent } from './setting/setting.component';

const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent},
  {path: 'circles', component: CirclesComponent},
  {path: 'settings', component: SettingComponent},
];

@NgModule({
  declarations: [
    HomeComponent,
    DashboardComponent,
    UserPageComponent,
    CirclesComponent,
    SettingComponent
  ],
  imports: [
    ProjectModulesImportsModule,
    RouterModule.forChild(routes),
  ]
})
export class PagesModule {
}

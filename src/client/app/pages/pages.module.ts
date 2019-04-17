import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {DashboardComponent} from './dashboard/dashboard.component';
import {HomeComponent} from "./home/home.component";
import {ProjectModulesImportsModule} from "../modules/imports/project-modules-imports.module";
import {UserPageComponent} from './u/user-page.component';
import {CirclesComponent} from './circles/circles.component';
import {SettingsComponent} from './settings/settings.component';
import { DiscoverComponent } from './discover/discover.component';
import { PostPageComponent } from './p/p.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent},
  {path: 'circles', component: CirclesComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'discover', component: DiscoverComponent},
  {path: 'u/:userId', component: UserPageComponent},
  {path: 'p/:postId', component: PostPageComponent},
  {path: 'notifications', component: NotificationsComponent},
];

@NgModule({
  declarations: [
    HomeComponent,
    DashboardComponent,
    UserPageComponent,
    CirclesComponent,
    SettingsComponent,
    DiscoverComponent,
    PostPageComponent,
    NotificationsComponent
  ],
  imports: [
    ProjectModulesImportsModule,
    RouterModule.forChild(routes),
  ]
})
export class PagesModule {
}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {SignUpComponent} from "./pages/sign-up/sign-up.component";

const routes: Routes = [
  // { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  // { path: 'home', component: HomeComponent },
  // { path: 'about', component: AboutComponent },
  // { path: 'contact', component: ContactComponent },
  // { path: 'contactus', redirectTo: 'contact' },
  //
  // // authentication demo
  // { path: 'login', component: LoginComponent },
  // {
  //   path: 'protected',
  //   component: ProtectedComponent,
  //   canActivate: [ LoggedInGuard ]
  // },
  //
  // // nested
  // {
  //   path: 'products',
  //   component: ProductsComponent,
  //   children: childRoutes
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

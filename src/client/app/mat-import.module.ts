import {NgModule} from '@angular/core';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule
} from "@angular/material";
import {FlexLayoutModule} from "@angular/flex-layout";
import {LayoutModule} from "@angular/cdk/layout";
import {RouterTestingModule} from "@angular/router/testing";

const modules = [
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
];

@NgModule({
  declarations: [],
  imports: [...modules],
  exports: modules,
})
export class MatImportModule {
}

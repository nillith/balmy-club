import {FlexLayoutModule} from "@angular/flex-layout";
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
import {RouterTestingModule} from "@angular/router/testing";
import {LayoutModule} from "@angular/cdk/layout";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "./shared/shared.module";

export const testImports = [
  RouterTestingModule,
  NoopAnimationsModule,
  HttpClientTestingModule,
  FormsModule,
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
  MatDialogModule,
  MatTableModule,
  MatMenuModule,
  MatProgressSpinnerModule,
];

export const pageTestImports = [...testImports, SharedModule];

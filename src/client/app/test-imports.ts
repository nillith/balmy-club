import {FlexLayoutModule} from "@angular/flex-layout";
import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule, MatDialogRef,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule
} from "@angular/material";
import {RouterTestingModule} from "@angular/router/testing";
import {LayoutModule} from "@angular/cdk/layout";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "./shared/shared.module";
import {A11yModule} from "@angular/cdk/a11y";
import {CdkStepperModule} from "@angular/cdk/stepper";
import {CdkTableModule} from "@angular/cdk/table";
import {CdkTreeModule} from "@angular/cdk/tree";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {PortalModule} from "@angular/cdk/portal";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {JwtModule} from "@auth0/angular-jwt";
import {getAccessToken} from "../utils/auth";
import {environment} from "../environments/environment";
import {NgModule} from "@angular/core";



@NgModule({
  imports: [
    MatDialogModule
  ],
  providers: [
    // workaround: why I can't inject MatDialogRef in the unit test?
    {provide: MatDialogRef, useValue: {}},
  ],
})
export class MyMatDialogRefProvideModule {
}

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
  MatRadioModule,
  A11yModule,
  CdkStepperModule,
  CdkTableModule,
  CdkTreeModule,
  DragDropModule,
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonToggleModule,
  MatChipsModule,
  MatStepperModule,
  MatDatepickerModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatRippleModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTabsModule,
  MatTooltipModule,
  MatTreeModule,
  PortalModule,
  ScrollingModule,
  MyMatDialogRefProvideModule,
  JwtModule.forRoot({
    config: {
      tokenGetter: getAccessToken,
      whitelistedDomains: environment.jwtModule.whitelistedDomains,
      blacklistedRoutes: environment.jwtModule.blacklistedRoutes
    }
  }),
];

export const pageTestImports = [...testImports, SharedModule];

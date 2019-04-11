import {RouterTestingModule} from "@angular/router/testing";
import {BrowserAnimationsModule, NoopAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {FormsModule} from "@angular/forms";
import {LayoutModule} from "@angular/cdk/layout";
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
  MatDialogModule,
  MatDialogRef,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule, MatListOption,
  MatMenuModule,
  MatNativeDateModule, MatOptionModule,
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
import {FlexLayoutModule} from "@angular/flex-layout";
import {A11yModule} from "@angular/cdk/a11y";
import {CdkStepperModule} from "@angular/cdk/stepper";
import {CdkTableModule} from "@angular/cdk/table";
import {CdkTreeModule} from "@angular/cdk/tree";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {PortalModule} from "@angular/cdk/portal";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";
import {LoginDialogComponent} from "../../app/login-wall/login-dialog/login-dialog.component";
import {AvatarSettingDialogComponent} from "../../app/avatar-setting-dialog/avatar-setting-dialog.component";
import {MarkdownViewerComponent} from "../markdown/markdown-viewer/markdown-viewer.component";
import {LoginViewComponent} from "../../app/shared/views/login-view/login-view.component";
import {MainNavViewComponent} from "../../app/main-nav-view/main-nav-view.component";
import {MarkdownEditorComponent} from "../markdown/markdown-editor/markdown-editor.component";
import {MentionSelectionDialogComponent} from "../markdown/mention-selection-dialog/mention-selection-dialog.component";
import {UserInfoDialogComponent} from "../user-info/user-info-dialog/user-info-dialog.component";

@NgModule({
  imports: [
    MatDialogModule
  ],
  providers: [
    // workaround: why I can't inject MatDialogRef in the unit test?
    {provide: MatDialogRef, useValue: {}},
  ],
})
export class MyTestingHelperModule {
}

const appSpecificImports = [
  BrowserModule,
  BrowserAnimationsModule,
  RouterModule,
  HttpClientModule,
];

const testingSpecificImports = [
  NoopAnimationsModule,
  RouterTestingModule,
  HttpClientTestingModule,
  MyTestingHelperModule,
];

const commonImports = [
  CommonModule,
  FormsModule,
  LayoutModule,
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule,
  MatButtonModule,
  MatCheckboxModule,
  FlexLayoutModule,
  MatCardModule,
  MatInputModule,
  MatSidenavModule,
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
  MatOptionModule,
];


export const sharedImports = [...appSpecificImports, ...commonImports];

export const sharedTestingImports = [...testingSpecificImports, ...commonImports];

export const sharedEntryComponents = [
  LoginDialogComponent,
  AvatarSettingDialogComponent,
  MentionSelectionDialogComponent,
  UserInfoDialogComponent,
];

export const sharedComponents = [
  ...sharedEntryComponents,
  MainNavViewComponent,
  LoginViewComponent,
  MarkdownViewerComponent,
  MarkdownEditorComponent,
];



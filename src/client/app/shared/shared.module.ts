import {NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
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
import {FlexLayoutModule} from "@angular/flex-layout";
import {LayoutModule} from "@angular/cdk/layout";
import {HttpClientModule} from "@angular/common/http";
import {RouterModule} from "@angular/router";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {BrowserModule} from "@angular/platform-browser";
import {MainNavViewComponent} from './views/main-nav-view/main-nav-view.component';
import {LoginViewComponent} from './views/login-view/login-view.component';
import {FormsModule} from "@angular/forms";
import {LoginDialogComponent} from './dialogs/login-dialog/login-dialog.component';
import {A11yModule} from "@angular/cdk/a11y";
import {CdkStepperModule} from "@angular/cdk/stepper";
import {CdkTableModule} from "@angular/cdk/table";
import {CdkTreeModule} from "@angular/cdk/tree";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {PortalModule} from "@angular/cdk/portal";
import {ScrollingModule} from "@angular/cdk/scrolling";
import { MarkdownViewerComponent } from './views/markdown-viewer/markdown-viewer.component';

const modules = [
  BrowserModule,
  BrowserAnimationsModule,
  CommonModule,
  RouterModule,
  HttpClientModule,
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
];

const components = [
  MainNavViewComponent,
  LoginViewComponent,
  LoginDialogComponent,
  MarkdownViewerComponent,
];

@NgModule({
  declarations: [...components, ],
  imports: [...modules],
  exports: [...modules, ...components],
  entryComponents: [
    LoginDialogComponent
  ]
})

export class SharedModule {
  constructor(@Optional() @SkipSelf() parentModule: SharedModule) {
    if (parentModule) {
      throw new Error(
        'SharedModule is already loaded. Import it in the AppModule only');
    }
  }
}

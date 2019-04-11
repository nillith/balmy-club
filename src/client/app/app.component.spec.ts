import {async, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {ProjectModulesImportsTestingModule} from "./modules/imports/project-modules-imports-testing.module.spec";
import {LoginDialogComponent} from "./main/login-wall/login-dialog/login-dialog.component";
import {AvatarSettingDialogComponent} from "./main/avatar-setting-dialog/avatar-setting-dialog.component";
import {MainNavViewComponent} from "./main/main-nav-view/main-nav-view.component";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [ProjectModulesImportsTestingModule],
        declarations: [
          AppComponent,
          LoginDialogComponent,
          AvatarSettingDialogComponent,
          MainNavViewComponent
        ],
      })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [AvatarSettingDialogComponent],
        }
      })
      .compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});

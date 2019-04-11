import {async, TestBed} from '@angular/core/testing';

import {LoginWallService} from './login-wall.service';
import {ProjectModulesImportsTestingModule} from "../../modules/imports/project-modules-imports-testing.module.spec";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {LoginDialogComponent} from "./login-dialog/login-dialog.component";

describe('LoginWallService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginDialogComponent],
      imports: [ProjectModulesImportsTestingModule],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [LoginDialogComponent],
      }
    }).compileComponents();
  }));

  it('should be created', () => {
    const service: LoginWallService = TestBed.get(LoginWallService);
    expect(service).toBeTruthy();
  });
});

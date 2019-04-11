import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LoginDialogComponent} from './login-dialog.component';
import {ProjectModulesImportsTestingModule} from "../../../modules/imports/project-modules-imports-testing.module.spec";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";

describe('LoginDialogComponent', () => {
  let component: LoginDialogComponent;
  let fixture: ComponentFixture<LoginDialogComponent>;

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

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AvatarSettingDialogComponent} from './avatar-setting-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {ProjectModulesImportsTestingModule} from "../../modules/imports/project-modules-imports-testing.module.spec";
import {anchor, matDialogRef} from "../../test-providers.spec";

describe('AvatarSettingDialogComponent', () => {
  let component: AvatarSettingDialogComponent;
  let fixture: ComponentFixture<AvatarSettingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AvatarSettingDialogComponent],
      imports: [ProjectModulesImportsTestingModule],
      providers: [anchor, matDialogRef]
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [AvatarSettingDialogComponent],
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarSettingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

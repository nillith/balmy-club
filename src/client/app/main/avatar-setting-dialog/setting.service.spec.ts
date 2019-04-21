import {async, TestBed} from '@angular/core/testing';
import {SettingService} from './setting.service';
import {ProjectModulesImportsTestingModule} from "../../modules/imports/project-modules-imports-testing.module.spec";
import {AvatarSettingDialogComponent} from "./avatar-setting-dialog.component";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {IService} from "../../services/i.service";

describe('SettingService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AvatarSettingDialogComponent],
      imports: [ProjectModulesImportsTestingModule],

    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [AvatarSettingDialogComponent],
      }
    }).compileComponents();
  }));

  it('should be created', () => {
    const service: SettingService = TestBed.get(SettingService);
    expect(service).toBeTruthy();
  });
});

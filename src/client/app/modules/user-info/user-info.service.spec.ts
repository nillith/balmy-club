import {TestBed} from '@angular/core/testing';

import {UserInfoService} from './user-info.service';
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {UserInfoDialogComponent} from "./user-info-dialog/user-info-dialog.component";
import {ImportsTestingModule} from "../imports/imports-testing.module.spec";

describe('UserInfoService', () => {
  beforeEach(() => TestBed
    .configureTestingModule({
      imports: [ImportsTestingModule],
      declarations: [UserInfoDialogComponent]
    })
    .overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [UserInfoDialogComponent],
      }
    })
    .compileComponents());

  it('should be created', () => {
    const service: UserInfoService = TestBed.get(UserInfoService);
    expect(service).toBeTruthy();
  });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {UserInfoDialogComponent} from './user-info-dialog.component';
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";

describe('UserInfoDialogComponent', () => {
  let component: UserInfoDialogComponent;
  let fixture: ComponentFixture<UserInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [ImportsTestingModule],
        declarations: [UserInfoDialogComponent]
      })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [UserInfoDialogComponent],
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

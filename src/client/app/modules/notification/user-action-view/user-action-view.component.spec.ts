import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {UserActionViewComponent} from './user-action-view.component';
import {I18nModule} from "../../i18n/i18n.module";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {Activity} from "../../../../../shared/interf";

describe('UserActionViewComponent', () => {
  let component: UserActionViewComponent;
  let fixture: ComponentFixture<UserActionViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserActionViewComponent],
      imports: [ImportsTestingModule, I18nModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserActionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

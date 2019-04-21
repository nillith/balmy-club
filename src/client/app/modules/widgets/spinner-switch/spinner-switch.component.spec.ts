import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerSwitchComponent } from './spinner-switch.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {CommonPipesModule} from "../../common-pipes/common-pipes.module";
import {I18nModule} from "../../i18n/i18n.module";

describe('SpinnerSwitchComponent', () => {
  let component: SpinnerSwitchComponent;
  let fixture: ComponentFixture<SpinnerSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpinnerSwitchComponent],
      imports: [ImportsTestingModule, CommonPipesModule, I18nModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

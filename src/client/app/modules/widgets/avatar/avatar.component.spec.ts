import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarComponent } from './avatar.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {CommonPipesModule} from "../../common-pipes/common-pipes.module";

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AvatarComponent],
      imports: [ImportsTestingModule, CommonPipesModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

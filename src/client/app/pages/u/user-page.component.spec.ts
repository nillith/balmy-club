import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPageComponent } from './user-page.component';
import {ProjectModulesImportsTestingModule} from "../../modules/imports/project-modules-imports-testing.module.spec";

describe('UserPageComponent', () => {
  let component: UserPageComponent;
  let fixture: ComponentFixture<UserPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserPageComponent],
      imports: [ProjectModulesImportsTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsComponent } from './notifications.component';
import {ProjectModulesImportsTestingModule} from "../../modules/imports/project-modules-imports-testing.module.spec";

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationsComponent],
      imports: [ProjectModulesImportsTestingModule],
    }).compileComponents();
  }));


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationsComponent],
      imports: [ProjectModulesImportsTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

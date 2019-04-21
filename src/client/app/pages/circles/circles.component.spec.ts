import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CirclesComponent } from './circles.component';
import {ProjectModulesImportsTestingModule} from "../../modules/imports/project-modules-imports-testing.module.spec";

describe('CirclesComponent', () => {
  let component: CirclesComponent;
  let fixture: ComponentFixture<CirclesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CirclesComponent],
      imports: [ProjectModulesImportsTestingModule],
    }).compileComponents();
  }));



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CirclesComponent],
      imports: [ProjectModulesImportsTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CirclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

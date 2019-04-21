import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoverComponent } from './discover.component';
import {ProjectModulesImportsTestingModule} from "../../modules/imports/project-modules-imports-testing.module.spec";

describe('DiscoverComponent', () => {
  let component: DiscoverComponent;
  let fixture: ComponentFixture<DiscoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DiscoverComponent],
      imports: [ProjectModulesImportsTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

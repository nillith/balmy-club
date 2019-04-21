import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import {ProjectModulesImportsTestingModule} from "../../modules/imports/project-modules-imports-testing.module.spec";
import {IService} from "../../services/i.service";
let valueServiceSpy: jasmine.SpyObj<IService>;

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    const spy = jasmine.createSpyObj('IService', ['me']);
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [ProjectModulesImportsTestingModule],
      providers: [
        {
          provide: IService,
          useValue: spy
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

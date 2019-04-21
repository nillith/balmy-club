import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AvatarSettingDialogComponent} from './avatar-setting-dialog.component';
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {ProjectModulesImportsTestingModule} from "../../modules/imports/project-modules-imports-testing.module.spec";
import {anchor, matDialogRef} from "../../test-providers.spec";
import {IService} from "../../services/i.service";

let valueServiceSpy: jasmine.SpyObj<IService>;

describe('AvatarSettingDialogComponent', () => {
  let component: AvatarSettingDialogComponent;
  let fixture: ComponentFixture<AvatarSettingDialogComponent>;

  beforeEach(async(() => {
    const spy = jasmine.createSpyObj('IService', ['me']);
    TestBed.configureTestingModule({
      declarations: [AvatarSettingDialogComponent],
      imports: [ProjectModulesImportsTestingModule],
      providers: [anchor, matDialogRef,
        {
          provide: IService,
          useValue: spy
        }
      ]
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [AvatarSettingDialogComponent],
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarSettingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

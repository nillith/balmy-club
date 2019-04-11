import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarSettingDialogComponent } from './avatar-setting-dialog.component';
import {TestingImportsModule} from "../../modules/imports/testing-imports.module.spec";
import {MAT_DIALOG_DATA} from "@angular/material";

describe('AvatarSettingDialogComponent', () => {
  let component: AvatarSettingDialogComponent;
  let fixture: ComponentFixture<AvatarSettingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvatarSettingDialogComponent ],
      imports: [TestingImportsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            anchor: document.createElement('div')
          }
        }
      ]
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

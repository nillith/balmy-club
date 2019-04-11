import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {UserSelectionDialogComponent} from './user-selection-dialog.component';
import {TestingImportsModule} from "../../testing-imports.module.spec";
import {MAT_DIALOG_DATA} from "@angular/material";

describe('UserSelectionDialogComponent', () => {
  let component: UserSelectionDialogComponent;
  let fixture: ComponentFixture<UserSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserSelectionDialogComponent],
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
    fixture = TestBed.createComponent(UserSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

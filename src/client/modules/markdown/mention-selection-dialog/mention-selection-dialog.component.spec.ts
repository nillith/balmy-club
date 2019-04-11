import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MentionSelectionDialogComponent} from './mention-selection-dialog.component';
import {TestingImportsModule} from "../../imports/testing-imports.module.spec";
import {MAT_DIALOG_DATA} from "@angular/material";

describe('MentionSelectionDialogComponent', () => {
  let component: MentionSelectionDialogComponent;
  let fixture: ComponentFixture<MentionSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MentionSelectionDialogComponent],
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
    fixture = TestBed.createComponent(MentionSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {async, TestBed} from '@angular/core/testing';

import {MentionSelectionDialogService} from './mention-selection-dialog.service';
import {MAT_DIALOG_DATA} from "@angular/material";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {MentionSelectionDialogComponent} from "./mention-selection-dialog.component";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";

describe('MentionSelectionDialogService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MentionSelectionDialogComponent],
      imports: [ImportsTestingModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            anchor: document.createElement('div')
          }
        }
      ]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [MentionSelectionDialogComponent],
      }
    })
      .compileComponents();
  }));

  it('should be created', () => {
    const service: MentionSelectionDialogService = TestBed.get(MentionSelectionDialogService);
    expect(service).toBeTruthy();
  });
});

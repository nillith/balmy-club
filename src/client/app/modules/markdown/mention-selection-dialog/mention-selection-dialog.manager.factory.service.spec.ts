import {async, TestBed} from '@angular/core/testing';

import {MentionSelectionDialogManagerFactoryService} from './mention-selection-dialog.manager.factory.service';
import {MAT_DIALOG_DATA} from "@angular/material";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {MentionSelectionDialogComponent} from "./mention-selection-dialog.component";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";

describe('MentionSelectionDialogManagerFactoryService', () => {
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
    const service: MentionSelectionDialogManagerFactoryService = TestBed.get(MentionSelectionDialogManagerFactoryService);
    expect(service).toBeTruthy();
  });
});

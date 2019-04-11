import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MentionSelectionDialogComponent} from './mention-selection-dialog.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {anchor, matDialogRef} from "../../../test-providers.spec";

describe('MentionSelectionDialogComponent', () => {
  let component: MentionSelectionDialogComponent;
  let fixture: ComponentFixture<MentionSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [MentionSelectionDialogComponent],
        imports: [ImportsTestingModule],
        providers: [anchor, matDialogRef]
      })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [MentionSelectionDialogComponent],
        }
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownEditorComponent } from './markdown-editor.component';
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {MentionSelectionDialogComponent} from "../mention-selection-dialog/mention-selection-dialog.component";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";

describe('MarkdownEditorComponent', () => {
  let component: MarkdownEditorComponent;
  let fixture: ComponentFixture<MarkdownEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ImportsTestingModule],
      declarations: [ MarkdownEditorComponent, MentionSelectionDialogComponent]
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [MentionSelectionDialogComponent],
        }
      })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

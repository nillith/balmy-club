import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownEditorComponent } from './markdown-editor.component';
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {MentionSelectionDialogComponent} from "../mention-selection-dialog/mention-selection-dialog.component";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {I18nModule} from "../../i18n/i18n.module";
import {WidgetsModule} from "../../widgets/widgets.module";

describe('MarkdownEditorComponent', () => {
  let component: MarkdownEditorComponent;
  let fixture: ComponentFixture<MarkdownEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ImportsTestingModule, I18nModule, WidgetsModule],
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

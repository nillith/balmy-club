import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MentionSelectionDialogComponent} from './mention-selection-dialog.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {anchor, matDialogRef} from "../../../test-providers.spec";
import {I18nModule} from "../../i18n/i18n.module";
import {WidgetsModule} from "../../widgets/widgets.module";

describe('MentionSelectionDialogComponent', () => {
  let component: MentionSelectionDialogComponent;
  let fixture: ComponentFixture<MentionSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [MentionSelectionDialogComponent],
        imports: [ImportsTestingModule, I18nModule, WidgetsModule],
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

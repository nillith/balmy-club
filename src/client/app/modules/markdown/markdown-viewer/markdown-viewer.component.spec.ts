import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MarkdownViewerComponent} from './markdown-viewer.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {LoginDialogComponent} from "../../../main/login-wall/login-dialog/login-dialog.component";
import {I18nModule} from "../../i18n/i18n.module";
import {WidgetsModule} from "../../widgets/widgets.module";

describe('MarkdownViewerComponent', () => {
  let component: MarkdownViewerComponent;
  let fixture: ComponentFixture<MarkdownViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MarkdownViewerComponent, LoginDialogComponent],
      imports: [ImportsTestingModule, I18nModule, WidgetsModule],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [LoginDialogComponent],
      }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

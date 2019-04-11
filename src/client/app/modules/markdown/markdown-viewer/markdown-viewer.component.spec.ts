import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MarkdownViewerComponent} from './markdown-viewer.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {LoginDialogComponent} from "../../../main/login-wall/login-dialog/login-dialog.component";

describe('MarkdownViewerComponent', () => {
  let component: MarkdownViewerComponent;
  let fixture: ComponentFixture<MarkdownViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MarkdownViewerComponent, LoginDialogComponent],
      imports: [ImportsTestingModule],
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

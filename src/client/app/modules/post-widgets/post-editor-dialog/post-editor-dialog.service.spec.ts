import {async, TestBed} from '@angular/core/testing';

import { PostEditorDialogService } from './post-editor-dialog.service';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {PostEditorDialogComponent} from "./post-editor-dialog.component";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {MarkdownModule} from "../../markdown/markdown.module";
import {WidgetsModule} from "../../widgets/widgets.module";
import {CommonPipesModule} from "../../common-pipes/common-pipes.module";
import {I18nModule} from "../../i18n/i18n.module";

describe('PostEditorDialogService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostEditorDialogComponent],
      imports: [ImportsTestingModule, MarkdownModule, WidgetsModule, CommonPipesModule, I18nModule],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [PostEditorDialogComponent],
      }
    }).compileComponents();
  }));

  it('should be created', () => {
    const service: PostEditorDialogService = TestBed.get(PostEditorDialogService);
    expect(service).toBeTruthy();
  });
});

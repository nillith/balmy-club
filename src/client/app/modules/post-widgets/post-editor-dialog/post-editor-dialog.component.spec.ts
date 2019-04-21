import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PostEditorDialogComponent} from './post-editor-dialog.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {WidgetsModule} from "../../widgets/widgets.module";
import {I18nModule} from "../../i18n/i18n.module";
import {CommonPipesModule} from "../../common-pipes/common-pipes.module";
import {MarkdownModule} from "../../markdown/markdown.module";
import {matDialogRef} from "../../../test-providers.spec";
import {MAT_DIALOG_DATA} from "@angular/material";
import {IService} from "../../../services/i.service";
let valueServiceSpy: jasmine.SpyObj<IService>;
describe('PostEditorDialogComponent', () => {
  let component: PostEditorDialogComponent;
  let fixture: ComponentFixture<PostEditorDialogComponent>;
  const spy = jasmine.createSpyObj('IService', ['me']);
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostEditorDialogComponent],
      providers: [matDialogRef, {
        provide: MAT_DIALOG_DATA,
        useValue: {
          post: {}
        }
      },
        {
          provide: IService,
          useValue: spy
        }
        ],
      imports: [ImportsTestingModule, WidgetsModule, I18nModule, CommonPipesModule, MarkdownModule],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [PostEditorDialogComponent],
      }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostEditorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

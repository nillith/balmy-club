import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditorComponent } from './post-editor.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {MarkdownModule} from "../../markdown/markdown.module";
import {CommentEditorComponent} from "../comment-editor/comment-editor.component";
import {WidgetsModule} from "../../widgets/widgets.module";
import {I18nModule} from "../../i18n/i18n.module";
import {CommonPipesModule} from "../../common-pipes/common-pipes.module";

describe('PostEditorComponent', () => {
  let component: PostEditorComponent;
  let fixture: ComponentFixture<PostEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostEditorComponent, CommentEditorComponent],
      imports: [ImportsTestingModule, MarkdownModule, WidgetsModule, I18nModule, CommonPipesModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

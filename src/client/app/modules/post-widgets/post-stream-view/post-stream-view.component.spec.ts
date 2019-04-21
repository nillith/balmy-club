import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PostStreamViewComponent} from './post-stream-view.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {WidgetsModule} from "../../widgets/widgets.module";
import {CommonPipesModule} from "../../common-pipes/common-pipes.module";
import {I18nModule} from "../../i18n/i18n.module";
import {MarkdownModule} from "../../markdown/markdown.module";
import {PostGroupViewComponent} from "../post-group-view/post-group-view.component";
import {PostEditorComponent} from "../post-editor/post-editor.component";
import {CommentEditorComponent} from "../comment-editor/comment-editor.component";

describe('PostStreamViewComponent', () => {
  let component: PostStreamViewComponent;
  let fixture: ComponentFixture<PostStreamViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostStreamViewComponent, PostGroupViewComponent, PostEditorComponent, CommentEditorComponent],
      imports: [ImportsTestingModule, MarkdownModule, WidgetsModule, CommonPipesModule, I18nModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostStreamViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

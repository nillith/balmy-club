import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostGroupViewComponent } from './post-group-view.component';
import {MarkdownModule} from "../../markdown/markdown.module";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {PostEditorComponent} from "../post-editor/post-editor.component";
import {CommentEditorComponent} from "../comment-editor/comment-editor.component";

describe('PostGroupViewComponent', () => {
  let component: PostGroupViewComponent;
  let fixture: ComponentFixture<PostGroupViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostGroupViewComponent, PostEditorComponent, CommentEditorComponent],
      imports: [ImportsTestingModule, MarkdownModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostGroupViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

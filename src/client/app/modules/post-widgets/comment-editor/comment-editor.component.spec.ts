import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentEditorComponent } from './comment-editor.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {MarkdownModule} from "../../markdown/markdown.module";
import {PostEditorComponent} from "../post-editor/post-editor.component";

describe('CommentEditorComponent', () => {
  let component: CommentEditorComponent;
  let fixture: ComponentFixture<CommentEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentEditorComponent, PostEditorComponent ],
      imports: [ImportsTestingModule, MarkdownModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

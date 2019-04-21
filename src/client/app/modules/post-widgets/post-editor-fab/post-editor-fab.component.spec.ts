import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditorFabComponent } from './post-editor-fab.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {I18nModule} from "../../i18n/i18n.module";

describe('PostEditorFabComponent', () => {
  let component: PostEditorFabComponent;
  let fixture: ComponentFixture<PostEditorFabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostEditorFabComponent],
      imports: [ImportsTestingModule, I18nModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostEditorFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentActionViewComponent } from './comment-action-view.component';
import {I18nModule} from "../../i18n/i18n.module";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";

describe('CommentActionViewComponent', () => {
  let component: CommentActionViewComponent;
  let fixture: ComponentFixture<CommentActionViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommentActionViewComponent],
      imports: [ImportsTestingModule, I18nModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentActionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

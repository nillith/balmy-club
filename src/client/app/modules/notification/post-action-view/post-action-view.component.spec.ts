import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostActionViewComponent } from './post-action-view.component';
import {I18nModule} from "../../i18n/i18n.module";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";

describe('PostActionViewComponent', () => {
  let component: PostActionViewComponent;
  let fixture: ComponentFixture<PostActionViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostActionViewComponent],
      imports: [ImportsTestingModule, I18nModule],
    }).compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(PostActionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

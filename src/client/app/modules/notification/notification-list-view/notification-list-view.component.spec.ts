import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationListViewComponent } from './notification-list-view.component';
import {I18nModule} from "../../i18n/i18n.module";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {UserActionViewComponent} from "../user-action-view/user-action-view.component";
import {PostActionViewComponent} from "../post-action-view/post-action-view.component";
import {CommentActionViewComponent} from "../comment-action-view/comment-action-view.component";
import {WidgetsModule} from "../../widgets/widgets.module";

describe('NotificationListViewComponent', () => {
  let component: NotificationListViewComponent;
  let fixture: ComponentFixture<NotificationListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationListViewComponent, UserActionViewComponent, PostActionViewComponent, CommentActionViewComponent],
      imports: [ImportsTestingModule, I18nModule, WidgetsModule],
    }).compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationDialogComponent } from './notification-dialog.component';
import {I18nModule} from "../../i18n/i18n.module";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {NotificationListViewComponent} from "../notification-list-view/notification-list-view.component";
import {UserActionViewComponent} from "../user-action-view/user-action-view.component";
import {CommentActionViewComponent} from "../comment-action-view/comment-action-view.component";
import {PostActionViewComponent} from "../post-action-view/post-action-view.component";
import {WidgetsModule} from "../../widgets/widgets.module";
import {anchor, matDialogRef} from "../../../test-providers.spec";

describe('NotificationDialogComponent', () => {
  let component: NotificationDialogComponent;
  let fixture: ComponentFixture<NotificationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationDialogComponent, NotificationListViewComponent, UserActionViewComponent, PostActionViewComponent, CommentActionViewComponent],
      imports: [ImportsTestingModule, I18nModule, WidgetsModule],
      providers: [anchor, matDialogRef]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [NotificationDialogComponent],
      }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {async, TestBed} from '@angular/core/testing';

import {NotificationDialogService} from './notification-dialog.service';
import {NotificationDialogComponent} from "./notification-dialog.component";
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {I18nModule} from "../../i18n/i18n.module";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {NotificationListViewComponent} from "../notification-list-view/notification-list-view.component";
import {WidgetsModule} from "../../widgets/widgets.module";
import {anchor, matDialogRef} from "../../../test-providers.spec";
import {CommentActionViewComponent} from "../comment-action-view/comment-action-view.component";
import {PostActionViewComponent} from "../post-action-view/post-action-view.component";
import {UserActionViewComponent} from "../user-action-view/user-action-view.component";

describe('NotificationDialogService', () => {
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
  it('should be created', () => {
    const service: NotificationDialogService = TestBed.get(NotificationDialogService);
    expect(service).toBeTruthy();
  });
});

import {NgModule} from '@angular/core';
import {MarkdownModule} from "../markdown/markdown.module";
import {ImportsModule} from "../imports/imports.module";
import {WidgetsModule} from "../widgets/widgets.module";
import {CommonPipesModule} from "../common-pipes/common-pipes.module";
import {I18nModule} from "../i18n/i18n.module";
import {NotificationListViewComponent} from './notification-list-view/notification-list-view.component';
import {UserActionViewComponent} from './user-action-view/user-action-view.component';
import {PostActionViewComponent} from './post-action-view/post-action-view.component';
import {CommentActionViewComponent} from './comment-action-view/comment-action-view.component';
import {NotificationDialogComponent} from './notification-dialog/notification-dialog.component';


export const exportedEntryComponents = [
  NotificationDialogComponent
];
const exportedComponents = [
  ...exportedEntryComponents,
  NotificationListViewComponent,
];


@NgModule({
  declarations: [...exportedComponents, UserActionViewComponent, PostActionViewComponent, CommentActionViewComponent],
  imports: [
    ImportsModule,
    MarkdownModule,
    WidgetsModule,
    CommonPipesModule,
    I18nModule,
  ],
  exports: exportedComponents,
  entryComponents: exportedEntryComponents
})
export class NotificationModule {
}

import {NgModule} from '@angular/core';
import {CommentEditorComponent} from './comment-editor/comment-editor.component';
import {MarkdownModule} from "../markdown/markdown.module";
import {PostEditorComponent} from './post-editor/post-editor.component';
import {ImportsModule} from "../imports/imports.module";
import {PostGroupViewComponent} from './post-group-view/post-group-view.component';
import {PostEditorDialogComponent} from './post-editor-dialog/post-editor-dialog.component';
import {WidgetsModule} from "../widgets/widgets.module";
import {PostStreamViewComponent} from './post-stream-view/post-stream-view.component';
import {CommonPipesModule} from "../common-pipes/common-pipes.module";
import {I18nModule} from "../i18n/i18n.module";
import {PostEditorFabComponent} from './post-editor-fab/post-editor-fab.component';


export const exportedEntryComponents = [
  PostEditorDialogComponent
];
const exportedComponents = [
  ...exportedEntryComponents,
  CommentEditorComponent,
  PostEditorComponent,
  PostGroupViewComponent,
  PostStreamViewComponent,
  PostEditorFabComponent,
];


@NgModule({
  declarations: [...exportedComponents],
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
export class PostWidgetsModule {
}

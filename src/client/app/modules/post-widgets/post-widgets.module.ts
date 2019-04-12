import {NgModule} from '@angular/core';
import {CommentEditorComponent} from './comment-editor/comment-editor.component';
import {MarkdownModule} from "../markdown/markdown.module";
import {PostEditorComponent} from './post-editor/post-editor.component';
import {ImportsModule} from "../imports/imports.module";
import { PostGroupViewComponent } from './post-group-view/post-group-view.component';


export const exportedEntryComponents = [];
const exportedComponents = [
  ...exportedEntryComponents,
  CommentEditorComponent,
  PostEditorComponent,
  PostGroupViewComponent,
];


@NgModule({
  declarations: [...exportedComponents],
  imports: [
    ImportsModule,
    MarkdownModule,
  ],
  exports: exportedComponents,
  entryComponents: exportedEntryComponents
})
export class PostWidgetsModule {
}

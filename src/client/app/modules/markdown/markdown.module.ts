import {NgModule} from '@angular/core';
import {MarkdownViewerComponent} from "./markdown-viewer/markdown-viewer.component";
import {MarkdownEditorComponent} from "./markdown-editor/markdown-editor.component";
import {ImportsModule} from "../imports/imports.module";
import {MentionSelectionDialogComponent} from "./mention-selection-dialog/mention-selection-dialog.component";


export const exportedEntryComponents = [
  MentionSelectionDialogComponent
];
const exportedComponents = [
  MarkdownViewerComponent,
  MarkdownEditorComponent,
  ...exportedEntryComponents
];


@NgModule({
  declarations: [...exportedComponents],
  imports: [
    ImportsModule
  ],
  exports: exportedComponents,
  entryComponents: exportedEntryComponents
})
export class MarkdownModule {
}

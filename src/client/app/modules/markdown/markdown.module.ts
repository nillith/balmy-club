import {NgModule} from '@angular/core';
import {MarkdownViewerComponent} from "./markdown-viewer/markdown-viewer.component";
import {MarkdownEditorComponent} from "./markdown-editor/markdown-editor.component";
import {ImportsModule} from "../imports/imports.module";
import {MentionSelectionDialogComponent} from "./mention-selection-dialog/mention-selection-dialog.component";
import {I18nModule} from "../i18n/i18n.module";


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
    ImportsModule,
    I18nModule,
  ],
  exports: exportedComponents,
  entryComponents: exportedEntryComponents
})
export class MarkdownModule {
}

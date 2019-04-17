import {NgModule} from '@angular/core';
import {MarkdownModule} from "../markdown/markdown.module";
import {ImportsModule} from "../imports/imports.module";
import {WidgetsModule} from "../widgets/widgets.module";
import {CommonPipesModule} from "../common-pipes/common-pipes.module";
import {I18nModule} from "../i18n/i18n.module";


export const exportedEntryComponents = [];
const exportedComponents = [
  ...exportedEntryComponents,
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
export class NotificationModule {
}

import {NgModule} from '@angular/core';
import {MarkdownModule} from "../markdown/markdown.module";
import {ImportsModule} from "../imports/imports.module";
import {SpinnerSwitchComponent} from './spinner-switch/spinner-switch.component';
import {AvatarComponent} from './avatar/avatar.component';
import {CommonPipesModule} from "../common-pipes/common-pipes.module";
import { LanguageSelectorComponent } from './language-selector/language-selector.component';


export const exportedEntryComponents = [];
const exportedComponents = [
  ...exportedEntryComponents,
  SpinnerSwitchComponent,
  AvatarComponent,
  LanguageSelectorComponent,
];


@NgModule({
  declarations: [...exportedComponents],
  imports: [
    ImportsModule,
    MarkdownModule,
    CommonPipesModule,
  ],
  exports: exportedComponents,
  entryComponents: exportedEntryComponents
})
export class WidgetsModule {
}

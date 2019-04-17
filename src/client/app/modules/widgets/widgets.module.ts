import {NgModule} from '@angular/core';
import {MarkdownModule} from "../markdown/markdown.module";
import {ImportsModule} from "../imports/imports.module";
import {SpinnerSwitchComponent} from './spinner-switch/spinner-switch.component';
import {AvatarComponent} from './avatar/avatar.component';
import {CommonPipesModule} from "../common-pipes/common-pipes.module";
import {LanguageSelectorComponent} from './language-selector/language-selector.component';
import {I18nModule} from "../i18n/i18n.module";
import {PlusOneButtonComponent} from './plus-one-button/plus-one-button.component';


export const exportedEntryComponents = [];
const exportedComponents = [
  ...exportedEntryComponents,
  SpinnerSwitchComponent,
  AvatarComponent,
  LanguageSelectorComponent,
  PlusOneButtonComponent,
];


@NgModule({
  declarations: [...exportedComponents],
  imports: [
    ImportsModule,
    MarkdownModule,
    CommonPipesModule,
    I18nModule
  ],
  exports: exportedComponents,
  entryComponents: exportedEntryComponents
})
export class WidgetsModule {
}

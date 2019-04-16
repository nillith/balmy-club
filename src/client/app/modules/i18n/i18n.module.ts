import {NgModule} from '@angular/core';
import {ImportsModule} from "../imports/imports.module";
import {I18nPipe} from "./pipes/i18n.pipe";

export const exportedEntryComponents = [];
const exportedComponents = [
  ...exportedEntryComponents,
  I18nPipe
];


@NgModule({
  declarations: [...exportedComponents],
  imports: [
    ImportsModule
  ],
  exports: exportedComponents,
  entryComponents: exportedEntryComponents
})
export class I18nModule {
}

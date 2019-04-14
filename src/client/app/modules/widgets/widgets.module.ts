import {NgModule} from '@angular/core';
import {MarkdownModule} from "../markdown/markdown.module";
import {ImportsModule} from "../imports/imports.module";
import {SpinnerSwitchComponent} from './spinner-switch/spinner-switch.component';
import {AvatarComponent} from './avatar/avatar.component';


export const exportedEntryComponents = [];
const exportedComponents = [
  ...exportedEntryComponents,
  SpinnerSwitchComponent,
  AvatarComponent,
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
export class WidgetsModule {
}

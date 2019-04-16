import {NgModule} from '@angular/core';
import {UserLinkPipe} from './user-link.pipe';
import {AvatarUrlPipe} from './avatar-url.pipe';
import { I18nPipe } from './i18n.pipe';


export const exportedEntryComponents = [];
const exportedComponents = [
  ...exportedEntryComponents,
  UserLinkPipe, AvatarUrlPipe, I18nPipe
];


@NgModule({
  declarations: [...exportedComponents],
  imports: [],
  exports: exportedComponents,
  entryComponents: exportedEntryComponents
})
export class CommonPipesModule {
}

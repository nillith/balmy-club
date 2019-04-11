import { NgModule } from '@angular/core';
import {UserInfoDialogComponent} from "./user-info-dialog/user-info-dialog.component";
import {ImportsModule} from "../imports/imports.module";

export const exportedEntryComponents = [
  UserInfoDialogComponent
];
const exportedComponents = [
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
export class UserInfoModule { }

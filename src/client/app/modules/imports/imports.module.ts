import {NgModule, Optional, SkipSelf} from '@angular/core';
import {commonExternalModules} from "./module-list";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {RouterModule} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  exports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    HttpClientModule,
    ...commonExternalModules
  ],
})
export class ImportsModule {
  constructor(@Optional() @SkipSelf() parentModule: ImportsModule) {
    if (parentModule) {
      throw new Error(
        'ImportsModule is already loaded. Import it in the AppModule only');
    }
  }
}

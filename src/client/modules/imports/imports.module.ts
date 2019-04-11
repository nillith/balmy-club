import {NgModule, Optional, SkipSelf} from '@angular/core';
import {sharedComponents, sharedEntryComponents, sharedImports} from "./imports.config";

@NgModule({
  declarations: sharedComponents,
  imports: [...sharedImports],
  exports: [...sharedImports, ...sharedComponents],
  entryComponents: [...sharedEntryComponents]
})
export class ImportsModule {
  constructor(@Optional() @SkipSelf() parentModule: ImportsModule) {
    if (parentModule) {
      throw new Error(
        'ImportsModule is already loaded. Import it in the AppModule only');
    }
  }
}

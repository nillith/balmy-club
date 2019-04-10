import {NgModule, Optional, SkipSelf} from '@angular/core';
import {sharedComponents, sharedEntryComponents, sharedImports} from "./modules.config";

@NgModule({
  declarations: sharedComponents,
  imports: [...sharedImports],
  exports: [...sharedImports, ...sharedComponents],
  entryComponents: [...sharedEntryComponents]
})
export class SharedModule {
  constructor(@Optional() @SkipSelf() parentModule: SharedModule) {
    if (parentModule) {
      throw new Error(
        'SharedModule is already loaded. Import it in the AppModule only');
    }
  }
}

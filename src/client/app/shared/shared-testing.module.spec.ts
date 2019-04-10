import {NgModule} from '@angular/core';
import {sharedComponents, sharedEntryComponents} from "./modules.config";
import {TestingImportsModule} from "./testing-imports.module.spec";

@NgModule({
  declarations: sharedComponents,
  imports: [TestingImportsModule],
  exports: [TestingImportsModule, ...sharedComponents],
  entryComponents: [...sharedEntryComponents]
})
export class SharedTestingModule {
}

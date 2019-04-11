import {NgModule} from '@angular/core';
import {ImportsModule} from "./imports.module";
import {projectModules} from "./project-modules-list";

@NgModule({
  exports: [ImportsModule, ...projectModules]
})
export class ProjectModulesImportsModule {
}

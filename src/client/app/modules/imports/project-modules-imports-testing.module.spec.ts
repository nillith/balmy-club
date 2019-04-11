import {NgModule} from '@angular/core';
import {ImportsTestingModule} from "./imports-testing.module.spec";
import {projectModules} from "./project-modules-list";


@NgModule({
  exports: [ImportsTestingModule, ...projectModules],
})
export class ProjectModulesImportsTestingModule {
}

import { TestBed } from '@angular/core/testing';

import { I18nServiceService } from './i18n-service.service';
import {ProjectModulesImportsTestingModule} from "../modules/imports/project-modules-imports-testing.module.spec";

describe('I18nServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ProjectModulesImportsTestingModule]
  }));

  it('should be created', () => {
    const service: I18nServiceService = TestBed.get(I18nServiceService);
    expect(service).toBeTruthy();
  });
});

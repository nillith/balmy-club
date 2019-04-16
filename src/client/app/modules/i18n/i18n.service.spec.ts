import { TestBed } from '@angular/core/testing';

import { I18nService } from './i18n.service';
import {ProjectModulesImportsTestingModule} from "../imports/project-modules-imports-testing.module.spec";

describe('I18nService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ProjectModulesImportsTestingModule]
  }));

  it('should be created', () => {
    const service: I18nService = TestBed.get(I18nService);
    expect(service).toBeTruthy();
  });
});

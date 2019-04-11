import { TestBed } from '@angular/core/testing';

import { I18nServiceService } from './i18n-service.service';
import {SharedTestingModule} from "../modules/imports/shared-testing.module.spec";

describe('I18nServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [SharedTestingModule]
  }));

  it('should be created', () => {
    const service: I18nServiceService = TestBed.get(I18nServiceService);
    expect(service).toBeTruthy();
  });
});

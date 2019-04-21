import {async, TestBed} from '@angular/core/testing';

import { AuthService } from './auth.service';
import {ProjectModulesImportsTestingModule} from "../../../modules/imports/project-modules-imports-testing.module.spec";

describe('AuthService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ProjectModulesImportsTestingModule],
    }).compileComponents();
  }));

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });
});

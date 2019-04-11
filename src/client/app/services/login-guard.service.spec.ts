import {TestBed} from '@angular/core/testing';

import {LoginGuardService} from './login-guard.service';
import {SharedTestingModule} from "../shared/shared-testing.module.spec";

describe('LoginGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [SharedTestingModule]
  }));

  it('should be created', () => {
    const service: LoginGuardService = TestBed.get(LoginGuardService);
    expect(service).toBeTruthy();
  });
});

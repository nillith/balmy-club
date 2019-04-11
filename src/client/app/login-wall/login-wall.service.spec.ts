import {TestBed} from '@angular/core/testing';

import {LoginWallService} from './login-wall.service';
import {SharedTestingModule} from "../../modules/imports/shared-testing.module.spec";

describe('LoginWallService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [SharedTestingModule]
  }));

  it('should be created', () => {
    const service: LoginWallService = TestBed.get(LoginWallService);
    expect(service).toBeTruthy();
  });
});

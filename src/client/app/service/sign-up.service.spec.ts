import {TestBed} from '@angular/core/testing';
import {SignUpService} from './sign-up.service';
import {SharedTestingModule} from "../shared/shared-testing.module.spec";

describe('SignUpService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [SharedTestingModule]
  }));

  it('should be created', () => {
    const service: SignUpService = TestBed.get(SignUpService);
    expect(service).toBeTruthy();
  });
});

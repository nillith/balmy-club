import {TestBed} from '@angular/core/testing';

import {SignUpService} from './sign-up.service';
import {testImports} from "../test-imports";

describe('SignUpService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [...testImports]
  }));

  it('should be created', () => {
    const service: SignUpService = TestBed.get(SignUpService);
    expect(service).toBeTruthy();
  });
});

import {TestBed} from '@angular/core/testing';

import {AuthService} from './auth.service';
import {testImports} from "../test-imports";

describe('AuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [...testImports]
  }));

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });
});

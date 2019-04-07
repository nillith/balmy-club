import { TestBed } from '@angular/core/testing';

import { SignUpService } from './sign-up.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('SignUpService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule]
  }));

  it('should be created', () => {
    const service: SignUpService = TestBed.get(SignUpService);
    expect(service).toBeTruthy();
  });
});

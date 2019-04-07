import {TestBed} from '@angular/core/testing';

import {UserService} from './user.service';
import {testImports} from "../../test-imports";

describe('UserService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [...testImports]
  }));

  it('should be created', () => {
    const service: UserService = TestBed.get(UserService);
    expect(service).toBeTruthy();
  });
});

import {TestBed} from '@angular/core/testing';

import {UserService} from './user.service';
import {TestingImportsModule} from "../modules/imports/testing-imports.module.spec";

describe('UserService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [TestingImportsModule]
  }));

  it('should be created', () => {
    const service: UserService = TestBed.get(UserService);
    expect(service).toBeTruthy();
  });
});

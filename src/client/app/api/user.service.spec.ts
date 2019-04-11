import {TestBed} from '@angular/core/testing';

import {UserService} from './user.service';
import {ImportsTestingModule} from "../modules/imports/imports-testing.module.spec";

describe('UserService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ImportsTestingModule]
  }));

  it('should be created', () => {
    const service: UserService = TestBed.get(UserService);
    expect(service).toBeTruthy();
  });
});

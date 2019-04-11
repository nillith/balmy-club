import {TestBed} from '@angular/core/testing';

import {AccountService} from './account.service';
import {ImportsTestingModule} from "../modules/imports/imports-testing.module.spec";

describe('AccountService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ImportsTestingModule]
  }));

  it('should be created', () => {
    const service: AccountService = TestBed.get(AccountService);
    expect(service).toBeTruthy();
  });
});

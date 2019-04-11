import {TestBed} from '@angular/core/testing';

import {AccountService} from './account.service';
import {TestingImportsModule} from "../../shared/testing-imports.module.spec";

describe('AccountService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [TestingImportsModule]
  }));

  it('should be created', () => {
    const service: AccountService = TestBed.get(AccountService);
    expect(service).toBeTruthy();
  });
});

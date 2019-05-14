import {async, TestBed} from '@angular/core/testing';

import { AccountApiService } from './account-api.service';
import {ImportsTestingModule} from "../modules/imports/imports-testing.module.spec";

describe('AccountApiService', () => {
  beforeEach(async(() => {
  TestBed.configureTestingModule({
    imports: [ImportsTestingModule],
  }).compileComponents();
}));

  it('should be created', () => {
    const service: AccountApiService = TestBed.get(AccountApiService);
    expect(service).toBeTruthy();
  });
});

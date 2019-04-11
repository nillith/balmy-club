import {TestBed} from '@angular/core/testing';

import {IService} from './i.service';
import {ImportsTestingModule} from "../modules/imports/imports-testing.module.spec";

describe('IService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ImportsTestingModule]
  }));

  it('should be created', () => {
    const service: IService = TestBed.get(IService);
    expect(service).toBeTruthy();
  });
});

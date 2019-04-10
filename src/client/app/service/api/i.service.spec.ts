import {TestBed} from '@angular/core/testing';

import {IService} from './i.service';
import {TestingImportsModule} from "../../shared/testing-imports.module.spec";

describe('IService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [TestingImportsModule]
  }));

  it('should be created', () => {
    const service: IService = TestBed.get(IService);
    expect(service).toBeTruthy();
  });
});

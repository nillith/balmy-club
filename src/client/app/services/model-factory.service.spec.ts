import { TestBed } from '@angular/core/testing';

import { ModelFactoryService } from './model-factory.service';
import {ImportsTestingModule} from "../modules/imports/imports-testing.module.spec";

describe('ModelFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ImportsTestingModule]
  }));

  it('should be created', () => {
    const service: ModelFactoryService = TestBed.get(ModelFactoryService);
    expect(service).toBeTruthy();
  });
});

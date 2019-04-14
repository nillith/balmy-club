import { TestBed } from '@angular/core/testing';

import { ModelFactoryService } from './model-factory.service';

describe('ModelFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModelFactoryService = TestBed.get(ModelFactoryService);
    expect(service).toBeTruthy();
  });
});

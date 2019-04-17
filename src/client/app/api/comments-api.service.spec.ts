import { TestBed } from '@angular/core/testing';

import { CommentsApiService } from './comments-api.service';

describe('CommentsApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CommentsApiService = TestBed.get(CommentsApiService);
    expect(service).toBeTruthy();
  });
});

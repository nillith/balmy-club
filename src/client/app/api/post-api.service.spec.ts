import { TestBed } from '@angular/core/testing';

import { PostApiService } from './post-api.service';

describe('PostApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PostApiService = TestBed.get(PostApiService);
    expect(service).toBeTruthy();
  });
});

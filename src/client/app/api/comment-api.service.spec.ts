import { TestBed } from '@angular/core/testing';

import { CommentApiService } from './comment-api.service';

describe('CommentApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CommentApiService = TestBed.get(CommentApiService);
    expect(service).toBeTruthy();
  });
});

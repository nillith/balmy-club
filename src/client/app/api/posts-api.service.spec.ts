import {async, TestBed} from '@angular/core/testing';

import { PostsApiService } from './posts-api.service';
import {ImportsTestingModule} from "../modules/imports/imports-testing.module.spec";

describe('PostsApiService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ImportsTestingModule],
    }).compileComponents();
  }));

  it('should be created', () => {
    const service: PostsApiService = TestBed.get(PostsApiService);
    expect(service).toBeTruthy();
  });
});

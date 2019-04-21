import {async, TestBed} from '@angular/core/testing';

import { CommentsApiService } from './comments-api.service';
import {ImportsTestingModule} from "../modules/imports/imports-testing.module.spec";

describe('CommentsApiService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ImportsTestingModule],
    }).compileComponents();
  }));

  it('should be created', () => {
    const service: CommentsApiService = TestBed.get(CommentsApiService);
    expect(service).toBeTruthy();
  });
});

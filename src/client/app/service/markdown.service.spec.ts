import { TestBed } from '@angular/core/testing';

import { MarkdownService } from './markdown.service';
import {SharedTestingModule} from "../shared/shared-testing.module.spec";

describe('MarkdownService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [SharedTestingModule]
  }));

  it('should be created', () => {
    const service: MarkdownService = TestBed.get(MarkdownService);
    expect(service).toBeTruthy();
  });
});

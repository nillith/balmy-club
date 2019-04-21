import {async, TestBed} from '@angular/core/testing';

import { MarkdownService } from './markdown.service';
import {ImportsTestingModule} from "../imports/imports-testing.module.spec";

describe('MarkdownService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ImportsTestingModule],
    }).compileComponents();
  }));

  it('should be created', () => {
    const service: MarkdownService = TestBed.get(MarkdownService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { PostEditorDialogService } from './post-editor-dialog.service';

describe('PostEditorDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PostEditorDialogService = TestBed.get(PostEditorDialogService);
    expect(service).toBeTruthy();
  });
});

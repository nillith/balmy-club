import { TestBed } from '@angular/core/testing';

import { NotificationDialogService } from './notification-dialog.service';

describe('NotificationDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NotificationDialogService = TestBed.get(NotificationDialogService);
    expect(service).toBeTruthy();
  });
});

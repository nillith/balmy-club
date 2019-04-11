import { TestBed } from '@angular/core/testing';

import { UserSelectionDialogManagerFactoryService } from './user-selection-dialog.manager.factory.service';
import {SharedTestingModule} from "../shared/shared-testing.module.spec";

describe('UserSelectionDialogManagerFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [SharedTestingModule]
  }));

  it('should be created', () => {
    const service: UserSelectionDialogManagerFactoryService = TestBed.get(UserSelectionDialogManagerFactoryService);
    expect(service).toBeTruthy();
  });
});

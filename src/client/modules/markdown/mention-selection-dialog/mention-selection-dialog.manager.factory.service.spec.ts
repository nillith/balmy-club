import { TestBed } from '@angular/core/testing';

import { MentionSelectionDialogManagerFactoryService } from './mention-selection-dialog.manager.factory.service';
import {SharedTestingModule} from "../../imports/shared-testing.module.spec";

describe('MentionSelectionDialogManagerFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [SharedTestingModule]
  }));

  it('should be created', () => {
    const service: MentionSelectionDialogManagerFactoryService = TestBed.get(MentionSelectionDialogManagerFactoryService);
    expect(service).toBeTruthy();
  });
});

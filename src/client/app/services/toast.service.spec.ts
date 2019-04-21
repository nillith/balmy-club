import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';
import {ImportsTestingModule} from "../modules/imports/imports-testing.module.spec";

describe('ToastService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ImportsTestingModule]
  }));

  it('should be created', () => {
    const service: ToastService = TestBed.get(ToastService);
    expect(service).toBeTruthy();
  });
});

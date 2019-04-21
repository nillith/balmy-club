import {async, TestBed} from '@angular/core/testing';

import { NotificationsApiService } from './notifications-api.service';
import {ImportsTestingModule} from "../modules/imports/imports-testing.module.spec";

describe('NotificationsApiService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ImportsTestingModule],
    }).compileComponents();
  }));

  it('should be created', () => {
    const service: NotificationsApiService = TestBed.get(NotificationsApiService);
    expect(service).toBeTruthy();
  });
});

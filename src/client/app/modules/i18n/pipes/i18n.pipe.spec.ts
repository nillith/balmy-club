import {async, inject, TestBed} from '@angular/core/testing';
import {I18nPipe} from './i18n.pipe';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";
import {I18nService} from "../i18n.service";

describe('I18nPipe', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ImportsTestingModule],
    })
      .compileComponents();
  }));
  it('create an instance', inject([I18nService], (i18Service: I18nService) => {
    const pipe = new I18nPipe(i18Service);
    expect(pipe).toBeTruthy();
  }));
});

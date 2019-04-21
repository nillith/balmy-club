import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageSelectorComponent } from './language-selector.component';
import {ImportsTestingModule} from "../../imports/imports-testing.module.spec";

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LanguageSelectorComponent],
      imports: [ImportsTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LoginViewComponent} from './login-view.component';
import {TestingImportsModule} from "../../../../modules/imports/testing-imports.module.spec";

describe('LoginViewComponent', () => {
  let component: LoginViewComponent;
  let fixture: ComponentFixture<LoginViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginViewComponent],
      imports: [TestingImportsModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

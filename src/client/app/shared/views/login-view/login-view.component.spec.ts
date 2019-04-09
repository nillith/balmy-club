import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LoginViewComponent} from './login-view.component';
import {testImports} from "../../../test-imports";

describe('LoginViewComponent', () => {
  let component: LoginViewComponent;
  let fixture: ComponentFixture<LoginViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginViewComponent],
      imports: [...testImports],
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

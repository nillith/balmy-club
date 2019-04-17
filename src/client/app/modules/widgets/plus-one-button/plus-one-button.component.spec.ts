import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlusOneButtonComponent } from './plus-one-button.component';

describe('PlusOneButtonComponent', () => {
  let component: PlusOneButtonComponent;
  let fixture: ComponentFixture<PlusOneButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlusOneButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlusOneButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

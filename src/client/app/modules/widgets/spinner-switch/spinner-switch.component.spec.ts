import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerSwitchComponent } from './spinner-switch.component';

describe('SpinnerSwitchComponent', () => {
  let component: SpinnerSwitchComponent;
  let fixture: ComponentFixture<SpinnerSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpinnerSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

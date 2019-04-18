import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationListViewComponent } from './notification-list-view.component';

describe('NotificationListViewComponent', () => {
  let component: NotificationListViewComponent;
  let fixture: ComponentFixture<NotificationListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentActionViewComponent } from './comment-action-view.component';

describe('CommentActionViewComponent', () => {
  let component: CommentActionViewComponent;
  let fixture: ComponentFixture<CommentActionViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentActionViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentActionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

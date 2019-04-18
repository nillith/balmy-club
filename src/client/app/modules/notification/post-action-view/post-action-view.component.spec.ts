import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostActionViewComponent } from './post-action-view.component';

describe('PostActionViewComponent', () => {
  let component: PostActionViewComponent;
  let fixture: ComponentFixture<PostActionViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostActionViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostActionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

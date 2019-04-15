import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostStreamViewComponent } from './post-stream-view.component';

describe('PostStreamViewComponent', () => {
  let component: PostStreamViewComponent;
  let fixture: ComponentFixture<PostStreamViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostStreamViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostStreamViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditorFabComponent } from './post-editor-fab.component';

describe('PostEditorFabComponent', () => {
  let component: PostEditorFabComponent;
  let fixture: ComponentFixture<PostEditorFabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostEditorFabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostEditorFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

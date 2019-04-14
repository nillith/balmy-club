import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditorDialogComponent } from './post-editor-dialog.component';

describe('PostEditorDialogComponent', () => {
  let component: PostEditorDialogComponent;
  let fixture: ComponentFixture<PostEditorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostEditorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostEditorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

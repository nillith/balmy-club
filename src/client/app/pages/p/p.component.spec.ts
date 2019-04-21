import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPageComponent } from './p.component';
import {ProjectModulesImportsTestingModule} from "../../modules/imports/project-modules-imports-testing.module.spec";

describe('PostPageComponent', () => {
  let component: PostPageComponent;
  let fixture: ComponentFixture<PostPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostPageComponent],
      imports: [ProjectModulesImportsTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {async, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {testImports} from "./test-imports";
import {MainNavViewComponent} from "./shared/views/main-nav-view/main-nav-view.component";

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [...testImports],
      declarations: [
        AppComponent,
        MainNavViewComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});

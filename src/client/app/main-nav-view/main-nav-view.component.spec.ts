import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MainNavViewComponent} from './main-nav-view.component';
import {TestingImportsModule} from "../../modules/imports/testing-imports.module.spec";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {LoginDialogComponent} from "../login-wall/login-dialog/login-dialog.component";

describe('MainNavViewComponent', () => {
  let component: MainNavViewComponent;
  let fixture: ComponentFixture<MainNavViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainNavViewComponent, LoginDialogComponent],
      imports: [TestingImportsModule],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [LoginDialogComponent],
      }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainNavViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

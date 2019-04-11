import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MainNavViewComponent} from './main-nav-view.component';
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {LoginDialogComponent} from "../login-wall/login-dialog/login-dialog.component";
import {ProjectModulesImportsTestingModule} from "../../modules/imports/project-modules-imports-testing.module.spec";
import {LoginWallService} from "../login-wall/login-wall.service";

describe('MainNavViewComponent', () => {
  let component: MainNavViewComponent;
  let fixture: ComponentFixture<MainNavViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainNavViewComponent, LoginDialogComponent],
      imports: [ProjectModulesImportsTestingModule],
      providers: [{
        provide: LoginWallService,
        useValue: {
          isLoggedIn() {
            return true;
          }
        }
      }]
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

import {TestBed} from '@angular/core/testing';
import {SignUpService} from './sign-up.service';
import {ProjectModulesImportsTestingModule} from "../modules/imports/project-modules-imports-testing.module.spec";

describe('SignUpService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ProjectModulesImportsTestingModule]
  }));

  it('should be created', () => {
    const service: SignUpService = TestBed.get(SignUpService);
    expect(service).toBeTruthy();
  });
});

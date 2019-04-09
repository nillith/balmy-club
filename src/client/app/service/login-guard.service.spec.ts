import {TestBed} from '@angular/core/testing';

import {LoginGuardService} from './login-guard.service';
import {testImports} from "../test-imports";
import {LoginDialogComponent} from "../shared/dialogs/login-dialog/login-dialog.component";

describe('LoginGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [LoginDialogComponent],
    imports: [...testImports]
  }));

  it('should be created', () => {
    const service: LoginGuardService = TestBed.get(LoginGuardService);
    expect(service).toBeTruthy();
  });
});

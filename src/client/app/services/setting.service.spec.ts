import {TestBed} from '@angular/core/testing';
import {SettingService} from './setting.service';
import {ProjectModulesImportsTestingModule} from "../modules/imports/project-modules-imports-testing.module.spec";

describe('SettingService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ProjectModulesImportsTestingModule]
  }));

  it('should be created', () => {
    const service: SettingService = TestBed.get(SettingService);
    expect(service).toBeTruthy();
  });
});

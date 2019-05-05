import {Pipe, PipeTransform} from '@angular/core';
import {I18nService} from "../i18n.service";
import {StringIds} from "../translations/string-ids";

@Pipe({
  name: 'i18n'
})
export class I18nPipe implements PipeTransform {
  constructor(private i18nService: I18nService) {
  }

  transform(stringId: StringIds, interpolation?: any): any {
    return this.i18nService.translate(stringId, interpolation);
  }
}

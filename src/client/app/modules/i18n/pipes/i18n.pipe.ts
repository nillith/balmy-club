import {Pipe, PipeTransform} from '@angular/core';
import {I18nService} from "../i18n.service";
import {StringIds} from "../translations/string-ids";
import * as en from "../translations/en";

const english = en.values;

@Pipe({
  name: 'i18n'
})
export class I18nPipe implements PipeTransform {
  constructor(private i18nService: I18nService) {
  }

  transform(stringId: StringIds, interpolation?: any): any {
    const str = this.i18nService.values[stringId] || english[stringId] || stringId;
    if (!interpolation) {
      return str;
    }
    return String(str).replace(/{{(.*?)}}/g, (matched, group1) => {
      return interpolation[group1.trim()];
    });
  }
}

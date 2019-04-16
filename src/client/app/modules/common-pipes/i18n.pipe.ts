import {Pipe, PipeTransform} from '@angular/core';
import {I18nService} from "../../services/i18n.service";
import {StringIds} from "../../../i18n/string-ids";

@Pipe({
  name: 'i18n'
})
export class I18nPipe implements PipeTransform {
  constructor(private i18nService: I18nService) {
  }

  transform(stringId: StringIds, args?: any): any {
    return this.i18nService.values[stringId] || stringId;
  }
}

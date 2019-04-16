import {Injectable} from '@angular/core';
import {TRANSLATIONS} from "./translations";
import {cloneFields} from "../../../../shared/utils";

const LANGUAGE_OPTION_KEY = 'language';
const DEFAULT_LANGUAGE_CODE = 'en';

@Injectable({
  providedIn: 'root'
})
export class I18nService {

  public values: any;
  public code: string;
  public name: string;

  constructor() {
    const self = this;
    self.changeLanguageByCode(self.language);
  }

  private setTranslation(trans) {
    cloneFields(trans, [
      'values', 'name', 'code'
    ], this);
  }


  get language() {
    return localStorage.getItem(LANGUAGE_OPTION_KEY) || navigator.language;
  }

  changeLanguageByCode(v: string) {
    const self = this;
    localStorage.setItem(LANGUAGE_OPTION_KEY, v);

    const trans = TRANSLATIONS[v] || TRANSLATIONS[DEFAULT_LANGUAGE_CODE];
    self.setTranslation(trans);
  }
}

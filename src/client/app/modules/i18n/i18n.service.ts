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
  public changing = false;

  constructor() {
    const _this = this;
    _this.changeLanguageByCode(_this.language);
  }

  private setTranslation(trans) {
    const _this = this;
    if (_this.code !== trans.code) {
      cloneFields(trans, [
        'values', 'name', 'code'
      ], this);

      _this.changing = true;
      setTimeout(() => {
        _this.changing = false;
      });
      document.documentElement.setAttribute('lang', _this.code);
    }
  }

  get language() {
    return localStorage.getItem(LANGUAGE_OPTION_KEY) || navigator.language;
  }

  changeLanguageByCode(v: string) {
    const _this = this;
    localStorage.setItem(LANGUAGE_OPTION_KEY, v);

    const trans = TRANSLATIONS[v] || TRANSLATIONS[DEFAULT_LANGUAGE_CODE];
    _this.setTranslation(trans);
  }
}

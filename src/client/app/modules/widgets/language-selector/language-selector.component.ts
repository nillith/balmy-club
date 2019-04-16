import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {TRANSLATIONS} from "../../i18n/translations/index";
import {I18nService} from "../../i18n/i18n.service";

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {

  translations = TRANSLATIONS;

  @Output() change = new EventEmitter()

  constructor(public i18nService: I18nService) {
  }

  ngOnInit() {
  }

  onChooseLanguage(code) {
    this.i18nService.changeLanguageByCode(code);
    this.change.emit();
  }
}

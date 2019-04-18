import {Component, OnInit, ViewChild} from '@angular/core';
import {appConstants} from "../../app.constants";
import {NgForm, NgModel} from "@angular/forms";
import {ChangeSettingsRequest} from "../../../../shared/contracts";
import {IService} from "../../services/i.service";
import {ToastService} from "../../services/toast.service";
import {StringIds} from "../../modules/i18n/translations/string-ids";


interface ChangeSettingsData extends ChangeSettingsRequest {
  passwordConfirm?: string;
}

const settingFields = [
  'username',
  'nickname',
  'avatarUrl',
  'bannerUrl',
  'email',
  'password',
];

@Component({
  selector: 'app-setting',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  StringIds = StringIds;
  @ViewChild('formRef') formRef: NgForm;
  @ViewChild('passwordConfirm') passwordConfirmModel: NgModel;
  @ViewChild('password') passwordModel: NgModel;
  readonly appConstants = appConstants;
  settingsData: ChangeSettingsData = {};
  loading = false;

  constructor(public iService: IService, private toastService: ToastService) {
  }

  ngOnInit() {
    this.copyMeToSettingsData();
  }

  confirmDisabled() {
    const {passwordModel} = this;
    return passwordModel.invalid || !passwordModel.value;
  }

  onConfirmChange() {
    const confirm = this.passwordConfirmModel.value;
    if (!confirm || confirm.length < appConstants.MIN_PASSWORD_LENGTH) {
      return;
    }
    const password = this.passwordModel.value;
    setTimeout(() => this.passwordConfirmModel.control.setErrors(password === confirm ? null : {notmatch: true}));
  }

  cancelSettings() {
    this.copyMeToSettingsData();
  }

  copyMeToSettingsData() {
    const self = this;
    for (const k of settingFields) {
      self.settingsData[k] = self.iService.me[k];
    }
  }

  async saveSettings() {
    const self = this;
    self.loading = true;
    try {
      await self.iService.saveSettings(self.settingsData);
      self.toastService.showToast('save succeed!');
    } catch (e) {
      self.toastService.showToast(e.error || e.message);
    } finally {
      self.loading = false;
    }
  }
}

import {Component, OnInit, ViewChild} from '@angular/core';
import {appConstants} from "../../app.constants";
import {NgForm, NgModel} from "@angular/forms";
import {SettingsData} from "../../../../shared/interf";
import {IService} from "../../api/i.service";
import {ToastService} from "../../services/toast.service";

@Component({
  selector: 'app-setting',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  @ViewChild('formRef') formRef: NgForm;
  @ViewChild('passwordConfirm') passwordConfirmModel: NgModel;
  @ViewChild('password') passwordModel: NgModel;
  readonly appConstants = appConstants;
  settingsData: SettingsData = {};
  loading = false;

  constructor(public iService: IService, private toastService: ToastService) {
    const self = this;
    self.iService.me.assignOut(self.settingsData);
  }

  ngOnInit() {
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
    const self = this;
    self.iService.me.assignOut(self.settingsData);
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

import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from "@angular/material";
import {NgForm, NgModel} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {appConstants} from "../../../app.constants";
import {
  DirectSignUpRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignUpRequest
} from "../../../../../shared/contracts";
import {AuthService} from "./auth.service";
import {StringIds} from "../../../modules/i18n/translations/string-ids";
import {I18nService} from "../../../modules/i18n/i18n.service";
import {AccountApiService} from "../../../api/account-api.service";
import {ToastService} from "../../../services/toast.service";
import {PagePaths} from "../../../../../shared/constants";
import {Location} from '@angular/common';

enum DialogTypes {
  Login,
  SignUp,
  ForgotPassword,
  ResetPassword,
}

const DialogUrls = {
  [DialogTypes.Login]: PagePaths.Login,
  [DialogTypes.SignUp]: PagePaths.SignUp,
};

const SubmitButtonTexts = {
  [DialogTypes.Login]: StringIds.Login,
  [DialogTypes.SignUp]: StringIds.SignUp,
  [DialogTypes.ForgotPassword]: StringIds.RecoverPassword,
  [DialogTypes.ResetPassword]: StringIds.ResetPassword,
};

const SignUpToggleTexts = {
  [DialogTypes.Login]: StringIds.SignUp,
  [DialogTypes.SignUp]: StringIds.Login,
};

const PasswordToggleTexts = {
  [DialogTypes.Login]: StringIds.ForgotPassword,
  [DialogTypes.ForgotPassword]: StringIds.Login,
  [DialogTypes.ResetPassword]: StringIds.Login,
};

interface UiConfig {
  requiredFieldHint?: boolean;
  username?: boolean;
  nickname?: boolean;
  password?: boolean;
  mainExtra?: boolean;
  rememberMe?: boolean;
  passwordToggle?: boolean;
  signUpToggle?: boolean;
  email?: boolean;
  emailRequired?: boolean;
  passwordConfirm?: boolean;
}

const UiConfigs = {
  [DialogTypes.Login]: {
    username: true,
    password: true,
    mainExtra: true,
    rememberMe: true,
    passwordToggle: true,
    signUpToggle: true
  } as UiConfig,
  [DialogTypes.SignUp]: {
    requiredFieldHint: true,
    username: true,
    nickname: true,
    email: true,
    password: true,
    passwordConfirm: true,
    signUpToggle: true
  } as UiConfig,
  [DialogTypes.ForgotPassword]: {
    email: true,
    emailRequired: true,
    mainExtra: true,
    passwordToggle: true,
  } as UiConfig,
  [DialogTypes.ResetPassword]: {
    password: true,
    passwordConfirm: true
  } as UiConfig,
};


type LoginDialogModel = SignUpRequest | LoginRequest | ForgotPasswordRequest | {
  passwordConfirm?: string;
  token?: string;
};

interface OAuthIcon {
  url: string;
  icon: string;
  name: string;
}

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {
  StringIds = StringIds;

  oAuthIcons: OAuthIcon[] = [
    {
      url: '/auth/twitter',
      icon: '/assets/logos/twitter.png',
      name: 'Twitter'
    },
    {
      url: '/auth/github',
      icon: '/assets/logos/github.png',
      name: 'GitHub'
    },
    {
      url: '/auth/google',
      icon: '/assets/logos/google.svg',
      name: 'Google'
    }
  ];

  @ViewChild('formRef') formRef: NgForm;
  @ViewChild('passwordConfirm') passwordConfirmModel: NgModel;
  @ViewChild('password') passwordModel: NgModel;
  readonly appConstants = appConstants;
  DialogTypes: typeof DialogTypes = DialogTypes;
  dialogType = DialogTypes.Login;
  uiConfig = UiConfigs[DialogTypes.Login];
  loading = false;
  togging = false;
  dialogModel: LoginDialogModel = {};
  error = '';
  redirect: string | null = null;

  constructor(public dialogRef: MatDialogRef<LoginDialogComponent>,
              private activeRoute: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private accountApi: AccountApiService,
              private toast: ToastService,
              private location: Location,
              public i18nService: I18nService) {
  }

  ngOnInit() {
    const _this = this;
    const {pathname} = location;
    if (pathname) {
      if (pathname.startsWith(`/${PagePaths.SignUp}`)) {
        _this.onChangeDialogType(DialogTypes.SignUp);
        _this.redirect = '';
      } else if (pathname.startsWith(`/${PagePaths.Login}`)) {
        _this.onChangeDialogType(DialogTypes.Login);
        _this.redirect = '';
      } else if (pathname.startsWith(`/${PagePaths.ResetPassword}`)) {
        _this.redirect = '';
        _this.onChangeDialogType(DialogTypes.ResetPassword);
      }
    }
    _this.activeRoute.queryParams.subscribe(params => {
      (_this.dialogModel as any).token = params['token'];
    });
  }

  onChangeDialogType(t: number, updateUrl? = true) {
    const _this = this;
    _this.togging = true;
    setTimeout(() => {
      _this.togging = false;
      _this.dialogType = t;
      _this.uiConfig = UiConfigs[t];
      _this.error = '';
      if (updateUrl) {
        const url = DialogUrls[t];
        if (url) {
          _this.location.go(url);
        }
      }
    }, 233);
  }

  get submitButtonText() {
    return SubmitButtonTexts[this.dialogType];
  }

  get signUpToggleText() {
    return SignUpToggleTexts[this.dialogType];
  }

  get passwordToggleText() {
    return PasswordToggleTexts[this.dialogType];
  }

  confirmDisabled() {
    const {passwordModel} = this;
    return passwordModel && (passwordModel.invalid || !passwordModel.value);
  }

  onConfirmChange() {
    const confirm = this.passwordConfirmModel.value;
    if (!confirm || confirm.length < appConstants.MIN_PASSWORD_LENGTH) {
      return;
    }
    const password = this.passwordModel.value;
    setTimeout(() => this.passwordConfirmModel.control.setErrors(password === confirm ? null : {notmatch: true}));
  }


  closeDialog() {
    const {dialogRef, router, redirect} = this;
    dialogRef.close();
    if (null != redirect) {
      router.navigateByUrl(redirect);
    } else {
      setTimeout(() => {
        location.reload();
      }, 300);
    }
  }

  async onSubmit(ngForm: NgForm) {
    const _this = this;
    if (!ngForm.form.valid || _this.loading) {
      return;
    }
    let submitError;
    try {
      _this.error = '';
      const {dialogType, dialogModel, authService} = _this;
      _this.loading = true;
      switch (dialogType) {
        case DialogTypes.Login:
          await authService.login(dialogModel as LoginRequest);
          this.closeDialog();
          break;
        case DialogTypes.SignUp:
          await authService.signUpWithUsername(dialogModel as DirectSignUpRequest);
          _this.closeDialog();
          break;
        case DialogTypes.ForgotPassword:
          await _this.accountApi.forgotPassword(dialogModel as ForgotPasswordRequest);
          break;
        case DialogTypes.ResetPassword:
          if (await _this.accountApi.resetPassword(dialogModel as ResetPasswordRequest)) {
            _this.toast.showToast("password reset succeed!");
            _this.onChangeDialogType(DialogTypes.Login);
            _this.location.go(PagePaths.Login);
          }
          break;
      }
    } catch (e) {
      submitError = (e.error && (e.error.message || e.error)) || e.message;
    } finally {
      setTimeout(() => {
        _this.loading = false;
        if (submitError) {
          _this.error = submitError;
        }
      }, 1000);
    }
  }
}

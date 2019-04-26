import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from "@angular/material";
import {NgForm, NgModel} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {appConstants} from "../../../app.constants";
import {DirectSignUpRequest, LoginRequest, SignUpRequest} from "../../../../../shared/contracts";
import {AuthService} from "./auth.service";
import {StringIds} from "../../../modules/i18n/translations/string-ids";
import {I18nService} from "../../../modules/i18n/i18n.service";

enum DialogTypes {
  Login,
  SignUp,
  PasswordRecoverRequest,
  PasswordRecover,
}

const DialogUrl = {
  [DialogTypes.Login]: '/login',
  [DialogTypes.SignUp]: '/sign-up',
  [DialogTypes.SignUp]: '/password',
};

const SubmitButtonTexts = {
  [DialogTypes.Login]: StringIds.Login,
  [DialogTypes.SignUp]: StringIds.SignUp,
  [DialogTypes.PasswordRecoverRequest]: StringIds.RecoverPassword,
  [DialogTypes.PasswordRecover]: StringIds.ChangePassword,
};

const SignUpToggleTexts = {
  [DialogTypes.Login]: StringIds.SignUp,
  [DialogTypes.SignUp]: StringIds.Login,
};

const PasswordToggleTexts = {
  [DialogTypes.Login]: StringIds.ForgotPassword,
  [DialogTypes.PasswordRecoverRequest]: StringIds.Login,
  [DialogTypes.PasswordRecover]: StringIds.Login,
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
  [DialogTypes.PasswordRecoverRequest]: {
    email: true,
    emailRequired: true,
    mainExtra: true,
    passwordToggle: true,
  } as UiConfig,
};


type LoginDialogModel = SignUpRequest | LoginRequest | {
  passwordConfirm?: string;
};

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {
  StringIds = StringIds;

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
  signUpToken: string;
  error = '';
  redirect: string | null = null;
  changingLanguage = false;

  constructor(public dialogRef: MatDialogRef<LoginDialogComponent>,
              private activeRoute: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              public i18nService: I18nService) {
  }

  ngOnInit() {
    const {pathname} = location;
    if (pathname) {
      if (pathname.startsWith('/sign-up')) {
        this.onChangeDialogType(DialogTypes.SignUp);
        this.redirect = '';
      } else if (pathname.startsWith('/login')) {
        this.onChangeDialogType(DialogTypes.Login);
        this.redirect = '';
      }
    }
    this.activeRoute.queryParams.subscribe(params => {
      this.signUpToken = params['token'];
    });
  }

  onChangeDialogType(t: number) {
    const _this = this;
    _this.togging = true;
    setTimeout(() => {
      _this.togging = false;
      _this.dialogType = t;
      _this.uiConfig = UiConfigs[t];
      _this.error = '';
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
          this.closeDialog();
          break;
        case DialogTypes.PasswordRecoverRequest:
          break;
        case DialogTypes.PasswordRecover:
          break;
      }
    } catch (e) {
      _this.error = e.error || e.message;
    } finally {
      setTimeout(() => {
        _this.loading = false;
      }, 300);
    }
  }
}

import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from "@angular/material";
import {NgForm, NgModel} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {appConstants} from "../../../app-constants";
import {AuthService} from "../../../service/auth.service";
import {AuthPayload} from "../../../../../shared/interf";

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
  [DialogTypes.Login]: 'Login',
  [DialogTypes.SignUp]: 'Sign Up',
  [DialogTypes.PasswordRecoverRequest]: 'Recover Password',
  [DialogTypes.PasswordRecover]: 'Change Password',
};

const SignUpToggleTexts = {
  [DialogTypes.Login]: 'Sign Up?',
  [DialogTypes.SignUp]: 'Login?',
};

const PasswordToggleTexts = {
  [DialogTypes.Login]: 'Forgot Password?',
  [DialogTypes.PasswordRecoverRequest]: 'Login?',
  [DialogTypes.PasswordRecover]: 'Login?',
};

const UiConfigs = {
  [DialogTypes.Login]: {
    username: true,
    password: true,
    mainExtra: true,
    rememberMe: true,
    passwordToggle: true,
    signUpToggle: true
  },
  [DialogTypes.SignUp]: {
    username: true,
    email: true,
    password: true,
    passwordConfirm: true,
    signUpToggle: true
  },
  [DialogTypes.PasswordRecoverRequest]: {
    email: true,
    emailRequired: true,
    mainExtra: true,
    passwordToggle: true,
  }
};


interface LoginDialogModel extends AuthPayload {
  passwordConfirm?: string;
}

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {

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

  constructor(public dialogRef: MatDialogRef<LoginDialogComponent>, private activeRoute: ActivatedRoute, private authService: AuthService, private router: Router) {
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
    const self = this;
    self.togging = true;
    setTimeout(() => {
      self.togging = false;
      self.dialogType = t;
      self.uiConfig = UiConfigs[t];
      self.error = '';
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
    return passwordModel.invalid || !passwordModel.value;
  }

  onConfirmChange() {
    const confirm = this.passwordConfirmModel.value;
    if (!confirm || confirm.length < appConstants.minPasswordLength) {
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
    }
  }

  async onSubmit() {
    const self = this;
    try {
      self.error = '';
      const {dialogType, dialogModel, authService} = self;
      self.loading = true;
      switch (dialogType) {
        case DialogTypes.Login:
          await authService.login(dialogModel);
          this.dialogRef.close();
          break;
        case DialogTypes.SignUp:
          await authService.signUpWithEmail(dialogModel);
          this.dialogRef.close();
          break;
        case DialogTypes.PasswordRecoverRequest:
          break;
        case DialogTypes.PasswordRecover:
          break;
      }
    } catch (e) {
      self.error = e.message;
    } finally {
      setTimeout(() => {
        self.loading = false;
      }, 300);
    }
  }
}

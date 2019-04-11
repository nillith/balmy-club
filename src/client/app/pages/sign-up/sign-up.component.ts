import {Component, OnInit} from '@angular/core';
import {SignUpService} from "../../services/sign-up.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  signUpToken: string;

  constructor(public signUpService: SignUpService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.signUpToken = params['token'];
    });
  }

  async requestSignUp(email: string) {
    await this.signUpService.requestSignUp(email);
  }

  async signUp(username: string, password: string, confirm: string) {
    if (password === confirm) {
      const token = await this.signUpService.signUp(this.signUpToken, username, password);
    }
  }
}

import {Component} from '@angular/core';

@Component({
  selector: 'app-login-view',
  templateUrl: './login-view.component.html',
  styleUrls: ['./login-view.component.scss']
})
export class LoginViewComponent {

  username: string;
  password: string;

  constructor() {
  }

  login(): void {
    // if (this.username == 'admin' && this.password == 'admin') {
    //   this.router.navigate(["user"]);
    // } else {
    //   alert("Invalid credentials");
    // }
    console.log('login');
  }
}

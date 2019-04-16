import {Component} from '@angular/core';
import {appConstants} from "./app.constants";
import {NavEntry} from "../constants";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  navEntries: NavEntry[] = appConstants.sideNav;
}

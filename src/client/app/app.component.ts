import {Component} from '@angular/core';
import {appConstants} from "./app.constants";
import {NavEntry} from "../constants";
import {VERSION} from "../../shared/build"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  navEntries: NavEntry[] = appConstants.sideNav;
  version = VERSION;
}

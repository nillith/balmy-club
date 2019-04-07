import {Component} from '@angular/core';
import {sideNav} from "./app-constants";
import {NavEntry} from "./shared/main-nav-view/main-nav-view.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  navEntries: NavEntry[] = sideNav;
}

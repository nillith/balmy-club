import {Component, Input, OnInit} from '@angular/core';
import {UserModel} from "../../../models/user.model";

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {

  @Input() user: UserModel;

  constructor() {
  }

  ngOnInit() {
  }

}

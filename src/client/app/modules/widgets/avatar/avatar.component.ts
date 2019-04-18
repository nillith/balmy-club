import {Component, Input, OnInit} from '@angular/core';
import {MinimumUser} from "../../../../../shared/contracts";

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {

  @Input() user: MinimumUser
  @Input() size = '32px';

  constructor() {
  }

  ngOnInit() {
  }

}

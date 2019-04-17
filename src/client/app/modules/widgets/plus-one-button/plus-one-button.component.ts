import {Component, Input, OnInit} from '@angular/core';
import {NullaryAsyncAction, SwitchDebouncer} from "../../../../utils/switch-debouncer";

@Component({
  selector: 'app-plus-one-button',
  templateUrl: './plus-one-button.component.html',
  styleUrls: ['./plus-one-button.component.scss']
})
export class PlusOneButtonComponent implements OnInit {
  plusOne?: SwitchDebouncer;
  @Input() onAction: NullaryAsyncAction;
  @Input() offAction: NullaryAsyncAction;
  @Input() initialOn = false;

  constructor() {
  }

  ngOnInit() {
    const self = this;
    self.plusOne = new SwitchDebouncer(self.initialOn, self.onAction, self.offAction);
  }

  onPlusClick() {
    this.plusOne.switch();
  }
}

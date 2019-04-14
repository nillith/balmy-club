import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-spinner-switch',
  templateUrl: './spinner-switch.component.html',
  styleUrls: ['./spinner-switch.component.scss']
})
export class SpinnerSwitchComponent implements OnInit {
  @Input() icon?: string;

  private spinnerDiameter = 20;
  private spanSize = '20px';

  @Input()
  set size(v: number) {
    this.spinnerDiameter = v;
    this.spanSize = `${v}px`;
  }

  @Input() showSpinner = false;

  constructor() {
  }

  ngOnInit() {
  }
}

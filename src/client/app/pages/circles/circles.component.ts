import {Component, OnInit} from '@angular/core';
import {IService} from "../../api/i.service";

@Component({
  selector: 'app-circles',
  templateUrl: './circles.component.html',
  styleUrls: ['./circles.component.scss']
})
export class CirclesComponent implements OnInit {

  constructor(private iService: IService) {
  }

  circles = [
    {
      name: 'blah',
      users: 3
    },
    {
      name: 'blah',
      users: 3
    },
    {
      name: 'blah',
      users: 3
    },
    {
      name: 'blah',
      users: 3
    }
  ];

  selectedCircle?: any;

  ngOnInit() {

  }

  isCreatingNewCircle() {
    const self = this;
    return !!self.selectedCircle && self.selectedCircle.isNew;
  }

  onSelectCircle(i: number) {
    console.log(`i:${i}`);
    const self = this;
    self.selectedCircle = self.circles[i];
  }

  createCircle() {
    const self = this;
    if (!self.isCreatingNewCircle()) {
      self.selectedCircle = self.iService.buildCircle();
    }
  }

}

import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UserModel} from "../../models/user.model";
import {ToastService} from "../../services/toast.service";
import {IService} from "../../services/i.service";
import {MatSelect} from "@angular/material";

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent implements OnInit {

  id?: string;
  loading = true;
  user?: UserModel;

  @ViewChild('circleSelector') circleSelector: MatSelect;

  constructor(private route: ActivatedRoute, private iService: IService, private toastService: ToastService) {
  }

  ngOnInit() {
    const self = this;
    self.route.params.subscribe(async (params) => {
      try {
        self.id = params['id'];
        self.user = await self.iService.viewUserById(self.id);
        self.loading = false;
      } catch (e) {
        self.toastService.showToast(e.error || e.message);
      }
    });
  }

  onCircleButtonClick() {
    this.circleSelector.open();
  }

  onCircleSelectionChange(event) {
    console.log(event);
  }

  getCircleButtonText() {

  }


}

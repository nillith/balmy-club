import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UserModel} from "../../models/user.model";
import {ToastService} from "../../services/toast.service";
import {IService} from "../../services/i.service";
import {MatSelect} from "@angular/material";
import {PostGroup} from "../../modules/post-widgets/post-group-view/post-group-view.component";
import {HttpClient} from "@angular/common/http";
import {isValidStringId} from "../../../../shared/utils";
import {PostFetcher} from "../../modules/post-widgets/post-stream-view/post-stream-view.component";

class UserPostFetcher implements PostFetcher {
  private prevGroupIndex = 0;
  private nextGroupIndex = 0;
  private loading = false;

  constructor(private http: HttpClient, private userId: string) {

  }

  nextGroup(): Promise<PostGroup> {
    return undefined;
  }

  prevGroup(): Promise<PostGroup> {
    return undefined;
  }

}

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent implements OnInit {

  id?: string;
  loading = true;
  user?: UserModel;

  postFetcher?: PostFetcher;

  @ViewChild('circleSelector') circleSelector: MatSelect;

  constructor(private route: ActivatedRoute, private iService: IService, private toastService: ToastService, private http: HttpClient) {
  }

  ngOnInit() {
    const self = this;
    self.route.params.subscribe(async (params) => {
      try {
        self.id = params['id'];
        if (!isValidStringId(self.id)) {
          return self.toastService.showToast('unknow user');
        }

        self.user = await self.iService.viewUserById(self.id);
        self.loading = false;
        self.postFetcher = new UserPostFetcher(self.http, self.id);
      } catch (e) {
        self.toastService.showToast(e.error || e.message);
      }
    });
  }

  onCircleButtonClick() {
    this.circleSelector.open();
  }

  onCircleSelectionChange(event) {
  }

  getCircleButtonText() {

  }


}

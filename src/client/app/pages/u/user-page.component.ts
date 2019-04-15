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
import _ from 'lodash';

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

  userId?: string;
  loading = true;
  user?: UserModel;
  circleButtonText = 'Circle';
  circlesUpdating = false;

  postFetcher?: PostFetcher;

  userInCircleIds: string[] = [];
  circleSelects: string[] = [];

  @ViewChild('circleSelector') circleSelector: MatSelect;

  constructor(private route: ActivatedRoute, private iService: IService, private toastService: ToastService, private http: HttpClient) {
  }

  ngOnInit() {
    const self = this;
    self.route.params.subscribe(async (params) => {
      try {
        const userId = params['userId'];
        self.userId = userId;
        if (!isValidStringId(self.userId)) {
          return self.toastService.showToast('unknown user');
        }

        self.user = await self.iService.viewUserById(self.userId);
        self.userInCircleIds = self.iService.circles.map((c) => {
          if (c.isInCircle(userId)) {
            return c.id;
          }
        }).filter(Boolean);
        self.circleSelects = [...self.userInCircleIds];
        self.loading = false;
        self.postFetcher = new UserPostFetcher(self.http, self.userId);
      } catch (e) {
        self.toastService.showToast(e.error || e.message);
      }
    });
  }

  onCircleButtonClick() {
    this.circleSelector.open();
  }

  async onCircleSelectorClose() {
    console.log('on close');
    const self = this;
    self.circlesUpdating = true;
    try {
      const {circleSelects, userInCircleIds} = self;
      const addedCircles = _.difference(circleSelects, userInCircleIds);
      const removedCircles = _.difference(userInCircleIds, circleSelects);
      console.log(addedCircles);
      console.log(removedCircles);
      await self.iService.changeUserCircles(self.user, addedCircles, removedCircles);
    } catch (e) {
      self.toastService.showToast(e.error || e.message);
    } finally {
      self.circlesUpdating = false;
    }
  }
}

import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UserModel} from "../../models/user.model";
import {ToastService} from "../../services/toast.service";
import {IService} from "../../services/i.service";
import {MatSelect} from "@angular/material";
import {PostGroup} from "../../modules/post-widgets/post-group-view/post-group-view.component";
import {HttpClient} from "@angular/common/http";
import {isValidStringId, utcTimestamp} from "../../../../shared/utils";
import {PostFetcher} from "../../modules/post-widgets/post-stream-view/post-stream-view.component";
import _ from 'lodash';
import {API_URLS, getIconMenuOption, IconMenuOption, MenuActions} from "../../../constants";
import {StringIds} from "../../modules/i18n/translations/string-ids";
import {POSTS_GROUP_SIZE} from "../../../../shared/constants";

class UserPostFetcher implements PostFetcher {
  private container?: PostGroup[];
  private groupIndex = 0;
  private loading = false;
  private goOn = false;
  private end = false;
  private timestamp = utcTimestamp();

  constructor(private http: HttpClient, private userId: string, private user: any) {

  }

  start(container: PostGroup[]) {
    this.container = container;
    this.nextGroup();
  }

  loadMore() {
    const self = this;
    if (self.end) {
      return;
    }
    if (self.loading) {
      self.goOn = true;
    } else {
      self.nextGroup();
    }
  }

  isEnd(): boolean {
    return this.end;
  }

  async nextGroup() {
    const self = this;
    self.loading = true;
    self.goOn = false;

    const data = await self.http.get(`${API_URLS.USERS}/${self.userId}/posts?t=${self.timestamp}&g=${self.groupIndex}`, {
      responseType: 'text'
    }).toPromise();

    try {
      const result = JSON.parse(data);
      if (result.length < POSTS_GROUP_SIZE) {
        self.end = true;
      }
      for (const g of result) {
        g.author = self.user;
      }
      self.container.push(result);
      ++self.groupIndex;
    } catch (e) {
      self.end = true;
      console.log(e);
    } finally {
      if (self.goOn) {
        setTimeout(() => {
          self.nextGroup();
        });
      } else {
        self.loading = false;
      }


    }
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
  circleButtonText = StringIds.Circle;
  circlesUpdating = false;

  postFetcher?: PostFetcher;
  extraMenuItems: IconMenuOption[] = [];

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
        self.user.id = userId;
        self.updateCircleStatus();
        self.loading = false;
        self.postFetcher = new UserPostFetcher(self.http, self.userId, self.user);
        self.updateExtraMenuItems();
      } catch (e) {
        self.toastService.showToast(e.error || e.message);
      }
    });
  }

  updateExtraMenuItems() {
    const self = this;
    const {user} = self;
    if (user.blockedByMe) {
      self.extraMenuItems = getIconMenuOption([MenuActions.UnBlock]);
    } else if (user.isCircledByMe) {
      self.extraMenuItems = getIconMenuOption([MenuActions.Block]);
    } else {
      self.extraMenuItems = [];
    }
    self.extraMenuItems = []; // TODO
  }

  updateCircleStatus() {
    const self = this;
    self.userInCircleIds = self.iService.getCirclesIdsContainsUser(self.user.id);
    self.user.isCircledByMe = !!self.userInCircleIds.length;
    self.circleSelects = [...self.userInCircleIds];
    this.updateCircleButtonText();
  }

  updateCircleButtonText() {
    const self = this;
    self.circleButtonText = self.user.isCircledByMe ? StringIds.Circled : StringIds.Circle;
  }

  onCircleButtonClick() {
    this.circleSelector.open();
  }

  async onCircleSelectorClose() {
    const self = this;
    self.circlesUpdating = true;
    try {
      const {circleSelects, userInCircleIds} = self;
      let addCircleIds = _.difference(circleSelects, userInCircleIds);
      let removeCircleIds = _.difference(userInCircleIds, circleSelects);

      if (!addCircleIds.length && !removeCircleIds.length) {
        return;
      }
      await self.iService.changeUserCircles(self.user, addCircleIds, removeCircleIds);
      self.updateCircleStatus();
    } catch (e) {
      self.toastService.showToast(e.error || e.message);
    } finally {
      self.circlesUpdating = false;
    }
  }

  onExtraAction(action: MenuActions) {
  }
}

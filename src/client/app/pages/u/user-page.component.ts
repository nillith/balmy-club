import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UserModel} from "../../models/user.model";
import {ToastService} from "../../services/toast.service";
import {IService} from "../../services/i.service";
import {MatSelect} from "@angular/material";
import {PostGroup} from "../../modules/post-widgets/post-group-view/post-group-view.component";
import {HttpClient} from "@angular/common/http";
import {isValidStringId} from "../../../../shared/utils";
import {
  DefaultStreamFetcher,
  StreamFetcher
} from "../../modules/post-widgets/post-stream-view/post-stream-view.component";
import _ from 'lodash';
import {API_URLS, getIconMenuOption, IconMenuOption, MenuActions} from "../../../constants";
import {StringIds} from "../../modules/i18n/translations/string-ids";

class UserStreamFetcher extends DefaultStreamFetcher {
  constructor(http: HttpClient, private user: any, iService: IService) {
    super(http, `${API_URLS.USERS}/${user.id}/posts`, iService);
  }

  protected preprocess(group: PostGroup) {
    for (const post of group) {
      post.author = this.user;
      if (post.comments) {
        for (const comment of post.comments) {
          comment.author = {
            id: comment.authorId,
            nickname: comment.authorNickname,
            avatarUrl: comment.authorAvatarUrl,
            isMe: this.iService.isMeById(comment.authorId),
          };
        }
      }
    }
    return group;
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

  streamFetcher?: StreamFetcher;
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
        self.streamFetcher = new UserStreamFetcher(self.http, self.user, self.iService);
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

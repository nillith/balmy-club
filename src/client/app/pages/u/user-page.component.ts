import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
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
import {UserResponse} from "../../../../shared/contracts";

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
            isMe: this.iService.isMyId(comment.authorId),
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
  user?: UserResponse;
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
    const _this = this;
    _this.route.params.subscribe(async (params) => {
      try {
        const userId = params['userId'];
        _this.userId = userId;
        if (!isValidStringId(_this.userId)) {
          return _this.toastService.showToast('unknown user');
        }
        _this.user = await _this.iService.viewUserById(_this.userId);
        _this.user.id = userId;
        _this.updateCircleStatus();
        _this.loading = false;
        _this.streamFetcher = new UserStreamFetcher(_this.http, _this.user, _this.iService);
        _this.updateExtraMenuItems();
      } catch (e) {
        _this.toastService.showToast(e.error || e.message);
      }
    });
  }

  updateExtraMenuItems() {
    const _this = this;
    const {user} = _this;
    if (user.blockedByMe) {
      _this.extraMenuItems = getIconMenuOption([MenuActions.UnBlock]);
    } else if (user.isCircledByMe) {
      _this.extraMenuItems = getIconMenuOption([MenuActions.Block]);
    } else {
      _this.extraMenuItems = [];
    }
    _this.extraMenuItems = []; // TODO
  }

  updateCircleStatus() {
    const _this = this;
    _this.userInCircleIds = _this.iService.getCirclesIdsContainsUser(_this.user.id);
    _this.user.isCircledByMe = !!_this.userInCircleIds.length;
    _this.circleSelects = [..._this.userInCircleIds];
    this.updateCircleButtonText();
  }

  updateCircleButtonText() {
    const _this = this;
    _this.circleButtonText = _this.user.isCircledByMe ? StringIds.Circled : StringIds.Circle;
  }

  onCircleButtonClick() {
    this.circleSelector.open();
  }

  async onCircleSelectorClose() {
    const _this = this;
    _this.circlesUpdating = true;
    try {
      const {circleSelects, userInCircleIds} = _this;
      let addCircleIds = _.difference(circleSelects, userInCircleIds);
      let removeCircleIds = _.difference(userInCircleIds, circleSelects);

      if (!addCircleIds.length && !removeCircleIds.length) {
        return;
      }
      await _this.iService.changeUserCircles(_this.user, addCircleIds, removeCircleIds);
      _this.updateCircleStatus();
    } catch (e) {
      _this.toastService.showToast(e.error || e.message);
    } finally {
      _this.circlesUpdating = false;
    }
  }

  onExtraAction(action: MenuActions) {
  }
}

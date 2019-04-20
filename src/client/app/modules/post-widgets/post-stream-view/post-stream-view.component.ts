import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PostGroup} from "../post-group-view/post-group-view.component";
import {HttpClient} from "@angular/common/http";
import {utcTimestamp} from "../../../../../shared/utils";
import {POSTS_GROUP_SIZE} from "../../../../../shared/constants";
import {IService} from "../../../services/i.service";
import {StringIds} from "../../i18n/translations/string-ids";


export interface StreamFetcher {
  start(container: PostGroup[]);

  loadMore();

  isEnd(): boolean;
}

export class DefaultStreamFetcher {
  private container?: PostGroup[];
  private groupIndex = 0;
  private loading = false;
  private goOn = false;
  private end = false;
  private timestamp = utcTimestamp();

  constructor(protected http: HttpClient, protected apiUrl: string, protected iService: IService) {

  }

  start(container: PostGroup[]) {
    this.container = container;
    this.nextGroup();
  }

  loadMore() {
    const _this = this;
    if (_this.end) {
      return;
    }
    if (_this.loading) {
      _this.goOn = true;
    } else {
      _this.nextGroup();
    }
  }

  protected preprocess(group: PostGroup) {
    for (const post of group) {
      post.author = {
        id: post.authorId,
        nickname: post.authorNickname,
        avatarUrl: post.authorAvatarUrl,
        isMe: this.iService.isMyId(post.authorId),
      };
      post.contextUsers = [];
      post.contextUsers.push(post.author);
      if (post.comments) {
        for (const comment of post.comments) {
          comment.author = {
            id: comment.authorId,
            nickname: comment.authorNickname,
            avatarUrl: comment.authorAvatarUrl,
            isMe: this.iService.isMyId(comment.authorId),
          };
          post.contextUsers.push(comment.author);
        }
      }
    }
    return group;
  }

  isEnd(): boolean {
    return this.end;
  }

  async nextGroup() {
    const _this = this;
    _this.loading = true;
    _this.goOn = false;

    const data = await _this.http.get(`${_this.apiUrl}?t=${_this.timestamp}&g=${_this.groupIndex}`, {
      responseType: 'text'
    }).toPromise();

    try {
      if (data.startsWith('[')) {
        const result = JSON.parse(data);

        if (!result || result.length < POSTS_GROUP_SIZE) {
          _this.end = true;
        }
        if (result && result.length) {
          _this.container.push(_this.preprocess(result));
          ++_this.groupIndex;
        }
      } else {
        _this.end = true;
      }
    } catch (e) {
      _this.end = true;
      console.log(e);
    } finally {
      if (_this.goOn) {
        setTimeout(() => {
          _this.nextGroup();
        });
      } else {
        _this.loading = false;
      }
    }
  }
}


@Component({
  selector: 'app-post-stream-view',
  templateUrl: './post-stream-view.component.html',
  styleUrls: ['./post-stream-view.component.scss']
})
export class PostStreamViewComponent implements OnInit, OnDestroy {

  @Input() streamFetcher: StreamFetcher;
  @ViewChild('loadmore') loadMoreDetector: ElementRef;
  StringIds = StringIds;
  groups: PostGroup[] = [];

  scrollListener: any;
  @Input() showDiscoverLinkIfEmpty = false;

  constructor() {
    this.scrollListener = this.onScroll.bind(this);
  }

  async ngOnInit() {
    const _this = this;
    _this.streamFetcher.start(_this.groups);
    window.addEventListener('scroll', this.scrollListener, true);
  }


  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollListener, true);
  }

  onScroll(e: Event) {
    const _this = this;
    const {nativeElement} = _this.loadMoreDetector;
    const rect = nativeElement.getBoundingClientRect();
    const totalHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < totalHeight) {
      _this.streamFetcher.loadMore();
    }
  }
}

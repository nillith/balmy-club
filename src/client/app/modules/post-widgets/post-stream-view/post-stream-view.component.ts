import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PostGroup} from "../post-group-view/post-group-view.component";
import {HttpClient} from "@angular/common/http";
import {utcTimestamp} from "../../../../../shared/utils";
import {POSTS_GROUP_SIZE} from "../../../../../shared/constants";
import {IService} from "../../../services/i.service";


export interface StreamFetcher {
  start(container: PostGroup[]);

  loadMore();
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
    const self = this;
    self.loading = true;
    self.goOn = false;

    const data = await self.http.get(`${self.apiUrl}?t=${self.timestamp}&g=${self.groupIndex}`, {
      responseType: 'text'
    }).toPromise();

    try {
      const result = JSON.parse(data);

      if (!result || result.length < POSTS_GROUP_SIZE) {
        self.end = true;
      }
      if (result && result.length) {
        self.container.push(self.preprocess(result));
        ++self.groupIndex;
      }

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
}


@Component({
  selector: 'app-post-stream-view',
  templateUrl: './post-stream-view.component.html',
  styleUrls: ['./post-stream-view.component.scss']
})
export class PostStreamViewComponent implements OnInit, OnDestroy {

  @Input() streamFetcher: StreamFetcher;
  @ViewChild('loadmore') loadMoreDetector: ElementRef;

  groups: PostGroup[] = [];

  scrollListener: any;

  constructor() {
    this.scrollListener = this.onScroll.bind(this);
  }

  async ngOnInit() {
    const self = this;
    self.streamFetcher.start(self.groups);
    window.addEventListener('scroll', this.scrollListener, true);
  }


  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollListener, true);
  }

  onScroll(e: Event) {
    const self = this;
    const {nativeElement} = self.loadMoreDetector;
    const rect = nativeElement.getBoundingClientRect();
    const totalHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < totalHeight) {
      self.streamFetcher.loadMore();
    }
  }
}

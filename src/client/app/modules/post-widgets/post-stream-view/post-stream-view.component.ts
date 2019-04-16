import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PostGroup} from "../post-group-view/post-group-view.component";


export interface PostFetcher {
  start(container: PostGroup[]);

  loadMore();
}

@Component({
  selector: 'app-post-stream-view',
  templateUrl: './post-stream-view.component.html',
  styleUrls: ['./post-stream-view.component.scss']
})
export class PostStreamViewComponent implements OnInit, OnDestroy {

  @Input() postFetcher: PostFetcher;
  @ViewChild('loadmore') loadMoreDetector: ElementRef;

  groups: PostGroup[] = [];

  scrollListener: any;

  constructor() {
    this.scrollListener = this.onScroll.bind(this);
  }

  async ngOnInit() {
    const self = this;
    self.postFetcher.start(self.groups)
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
      self.postFetcher.loadMore();
    }
  }
}

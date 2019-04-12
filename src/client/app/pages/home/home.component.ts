import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Post} from "../../../../shared/interf";
import Masonry from 'masonry-layout';
import {noop} from "../../../../shared/utils";
import {debounce} from "lodash";

const randomInt = function(min, max) {
  const span = max - min;
  return function() {
    return Math.floor(Math.random() * span) + min;
  };
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  posts: Post[] = [];
  masonry?: Masonry;
  isVisible = false;
  notifyChildSizeChange = noop;

  @ViewChild('container') container: ElementRef;

  // @ViewChildren(PostCardComponent) viewChildren?: QueryList<PostCardComponent>;

  ngAfterViewInit() {
    // viewChildren is set
    this.masonry = new Masonry(this.container.nativeElement, {
      itemSelector: ".time-line-item"
    });

    this.notifyChildSizeChange = debounce(() => {
      setTimeout(() => {
        this.masonry.layout();
      });
    }, 110);
    setTimeout(() => {
      this.masonry.layout();
      this.isVisible = true;
    });
  }

  constructor() {
    const post = {
      id: 'soateutoatu',
      content: `## Typographic replacements
AppPostCard
Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'


## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~

`
    };

    const r = randomInt(1, 4);

    let p;
    for (let i = 0; i < 12; ++i) {
      p = JSON.parse(JSON.stringify(post));
      p.content = p.content.repeat(r());
      p.comments = this.posts;
      this.posts.push(p);
    }
  }

  ngOnInit() {

  }
}

import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import Masonry from 'masonry-layout';
import {debounce} from "lodash";
import {noop} from "../../../../../shared/utils";
import {PostResponse} from "../../../../../shared/contracts";

export type PostGroup = PostResponse[];

@Component({
  selector: 'app-post-group-view',
  templateUrl: './post-group-view.component.html',
  styleUrls: ['./post-group-view.component.scss']
})
export class PostGroupViewComponent implements OnInit, AfterViewInit {

  @Input() posts: PostGroup = [];
  masonry?: Masonry;
  isVisible = false;
  onChildSizeChange = noop;

  @ViewChild('container')
  container: ElementRef;


  ngAfterViewInit() {
    const _this = this;
    _this.masonry = new Masonry(_this.container.nativeElement, {
      itemSelector: ".post-group-item"
    });

    _this.onChildSizeChange = debounce(() => {
      setTimeout(() => {
        _this.masonry.layout();
      });
    }, 180);
    setTimeout(() => {
      _this.masonry.layout();
      _this.isVisible = true;
    });
  }

  constructor() {
  }

  ngOnInit() {

  }

}

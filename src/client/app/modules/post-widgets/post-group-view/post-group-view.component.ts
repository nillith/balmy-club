import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {PostData} from "../../../../../shared/interf";
import Masonry from 'masonry-layout';
import {debounce} from "lodash";
import {noop} from "../../../../../shared/utils";
import {PostModel} from "../../../models/post.model";

export type PostGroup = PostModel[];

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
    const self = this;
    self.masonry = new Masonry(self.container.nativeElement, {
      itemSelector: ".post-group-item"
    });

    self.onChildSizeChange = debounce(() => {
      setTimeout(() => {
        self.masonry.layout();
      });
    }, 180);
    setTimeout(() => {
      self.masonry.layout();
      self.isVisible = true;
    });
  }

  constructor() {
  }

  ngOnInit() {

  }

}

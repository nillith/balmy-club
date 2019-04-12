import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Post} from "../../../../../shared/interf";
import Masonry from 'masonry-layout';
import {debounce} from "lodash";
import {noop} from "../../../../../shared/utils";

@Component({
  selector: 'app-post-group-view',
  templateUrl: './post-group-view.component.html',
  styleUrls: ['./post-group-view.component.scss']
})
export class PostGroupViewComponent implements OnInit, AfterViewInit {

  @Input() posts: Post[] = [];
  masonry?: Masonry;
  isVisible = false;
  onChildSizeChange = noop;

  @ViewChild('container') container: ElementRef;

  ngAfterViewInit() {
    // viewChildren is set
    this.masonry = new Masonry(this.container.nativeElement, {
      itemSelector: ".post-group-item"
    });

    this.onChildSizeChange = debounce(() => {
      setTimeout(() => {
        this.masonry.layout();
      });
    }, 110);
    setTimeout(() => {
      this.masonry.layout();
      this.isVisible = true;
    });
  }

  constructor() { }

  ngOnInit() {

  }

}

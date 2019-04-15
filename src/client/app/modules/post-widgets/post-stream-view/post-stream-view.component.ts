import {Component, Input, OnInit} from '@angular/core';
import {PostGroup} from "../post-group-view/post-group-view.component";


export interface PostFetcher {
  nextGroup(): Promise<PostGroup>;
  prevGroup(): Promise<PostGroup>;
}

@Component({
  selector: 'app-post-stream-view',
  templateUrl: './post-stream-view.component.html',
  styleUrls: ['./post-stream-view.component.scss']
})
export class PostStreamViewComponent implements OnInit {

  @Input() postFetcher: PostFetcher;

  groups: PostGroup[] = [];

  constructor() {
  }

  async ngOnInit() {
    const self = this;
    self.groups.push(await self.postFetcher.nextGroup());
  }

}

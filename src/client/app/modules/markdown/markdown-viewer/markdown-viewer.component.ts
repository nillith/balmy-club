import {Component, ElementRef, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {MarkdownService, MarkdownViewer} from "../markdown.service";


@Component({
  selector: 'app-markdown-viewer',
  templateUrl: './markdown-viewer.component.html',
  styleUrls: ['./markdown-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MarkdownViewerComponent implements OnInit {


  @Input()
  content: string;
  viewer: MarkdownViewer;

  constructor(private hostElement: ElementRef, private markdownService: MarkdownService) {

  }

  ngOnInit() {
    const _this = this;
    _this.viewer = _this.markdownService.createViewer({
      el: this.hostElement.nativeElement,
      initialValue: _this.content
    });
  }

}

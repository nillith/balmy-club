import {Component, ElementRef, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {MarkdownService, MarkdownViewer} from "../../../services/markdown/markdown.service";

// el: Element;
// exts?: string[];
// initialValue?: string;
// events?: IEvent[];
// hooks?: IEvent[];

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
    const self = this;
    self.viewer = self.markdownService.createViewer({
      el: this.hostElement.nativeElement,
      initialValue: this.content
    });

    // const editor = new Viewer({
    //   el: this.hostElement.nativeElement,
    //   initialValue: this.content
    // });
    //
    // const c = this.hostElement.nativeElement.querySelector('.tui-editor-contents');
    // c.style = this.hostElement.nativeElement.style;
  }

}

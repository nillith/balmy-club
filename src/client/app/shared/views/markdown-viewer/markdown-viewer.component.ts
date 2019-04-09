import {Component, Input, OnInit} from '@angular/core';
import {MarkdownService} from "../../../service/markdown.service";

@Component({
  selector: 'app-markdown-viewer',
  templateUrl: './markdown-viewer.component.html',
  styleUrls: ['./markdown-viewer.component.scss']
})
export class MarkdownViewerComponent implements OnInit {

  htmlContent: string;

  @Input()
  set content(v: string) {
    const self = this;
    self.htmlContent = '';
    setTimeout(() => {
      self.htmlContent = self.markdownRender.render(v);
    });
  }

  constructor(private markdownRender: MarkdownService) {

  }

  ngOnInit() {
  }

}

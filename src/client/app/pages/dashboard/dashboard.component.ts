import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MarkdownEditorComponent} from "../../../modules/markdown/markdown-editor/markdown-editor.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild('markdownEditor') editor: MarkdownEditorComponent;

  constructor() {
  }

  ngOnInit() {
  }

  onPost() {
  }

}

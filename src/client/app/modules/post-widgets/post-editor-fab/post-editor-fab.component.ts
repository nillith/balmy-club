import { Component, OnInit } from '@angular/core';
import {PostEditorDialogService} from "../post-editor-dialog/post-editor-dialog.service";

@Component({
  selector: 'app-post-editor-fab',
  templateUrl: './post-editor-fab.component.html',
  styleUrls: ['./post-editor-fab.component.scss']
})
export class PostEditorFabComponent implements OnInit {

  constructor(public postEditorDialogService: PostEditorDialogService) { }

  ngOnInit() {
  }

}

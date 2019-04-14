import {Injectable, Input, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material";
import {PostModel} from "../../../models/post.model";
import {ModelFactoryService} from "../../../services/model-factory.service";
import {PostEditorDialogComponent} from "./post-editor-dialog.component";
import {MarkdownEditorComponent} from "../../markdown/markdown-editor/markdown-editor.component";

@Injectable({
  providedIn: 'root'
})
export class PostEditorDialogService {
  @Input() editMode = true;

  @ViewChild('markdownEditor')
  private editor: MarkdownEditorComponent;

  constructor(public dialog: MatDialog, public modelFactor: ModelFactoryService) {
  }

  popup(post?: PostModel) {
    const self = this;
    if (!post) {
      post = self.modelFactor.buildPost();
      self.dialog.open(PostEditorDialogComponent, {
        data: {
          post
        },
      });
    }
  }
}

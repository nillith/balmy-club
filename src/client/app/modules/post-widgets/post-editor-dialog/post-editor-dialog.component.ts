import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {PostModel} from "../../../models/post.model";
import {IService} from "../../../api/i.service";
import {PostVisibilities} from "../../../../../shared/interf";
import {MarkdownEditorComponent} from "../../markdown/markdown-editor/markdown-editor.component";
import {ToastService} from "../../../services/toast.service";
import {MAX_POST_LENGTH} from "../../../../../shared/constants";

const VisibilityText = {
  [PostVisibilities.Public]: 'Public',
  [PostVisibilities.Private]: 'Private',
  [PostVisibilities.Extended]: 'Extended',
};

const VisibilityOptions = [
  {
    id: PostVisibilities.Public,
    name: 'Public',
  },
  {
    id: PostVisibilities.Extended,
    name: 'Extended',
  },
  {
    id: PostVisibilities.Private,
    name: 'Private'
  }
];

@Component({
  selector: 'app-post-editor-dialog',
  templateUrl: './post-editor-dialog.component.html',
  styleUrls: ['./post-editor-dialog.component.scss']
})
export class PostEditorDialogComponent implements OnInit {

  post: PostModel;
  loading = false;
  @ViewChild('visibilitySelector') visibilitySelector;
  visibilityOptions = VisibilityOptions;

  @ViewChild('markdownEditor')
  private editor: MarkdownEditorComponent;

  constructor(public dialogRef: MatDialogRef<PostEditorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: { post: PostModel },
              public iService: IService,
              public toastService: ToastService) {
    this.post = data.post;
  }


  ngOnInit() {
  }

  showVisibilitySelector() {
    this.visibilitySelector.open();
  }

  get visibilityName() {
    const self = this;
    return VisibilityText[self.post.visibility];
  }

  showCircleSelection() {
    return this.post.visibility === PostVisibilities.Private;
  }

  onVisibilityChange(e) {
    this.post.visibility = e.value;
  }


  cancelPost() {
    const self = this;
    self.editor.disableEditor();
    // self.dialogRef.close();
  }

  async publishPost() {
    const self = this;
    self.loading = true;
    let content = self.editor.markdown;
    if (content) {
      content = content.trim();
    }
    if (!content) {
      this.toastService.showToast('Empty post is not allowed!');
      return;
    }

    if (content.length > MAX_POST_LENGTH) {
      this.toastService.showToast(`Post exceeded max length: ${MAX_POST_LENGTH}!`);
    }
    const {post} = self;
    post.content = content;
    await post.save();
    self.dialogRef.close();
    self.loading = false;
  }
}
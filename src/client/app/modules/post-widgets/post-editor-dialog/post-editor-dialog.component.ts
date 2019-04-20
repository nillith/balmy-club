import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSelect} from "@angular/material";
import {PostModel} from "../../../models/post.model";
import {IService} from "../../../services/i.service";
import {PostVisibilities} from "../../../../../shared/interf";
import {MarkdownEditorComponent} from "../../markdown/markdown-editor/markdown-editor.component";
import {ToastService} from "../../../services/toast.service";
import {MAX_POST_LENGTH} from "../../../../../shared/constants";
import {StringIds} from "../../i18n/translations/string-ids";
import {MinimumUser} from "../../../../../shared/contracts";

const VisibilityText = {
  [PostVisibilities.Public]: StringIds.Public,
  [PostVisibilities.Private]: StringIds.PrivateCircle,
  //[PostVisibilities.Extended]: StringIds.ExtendedCircle,
};

const VisibilityOptions = [
  {
    id: PostVisibilities.Public,
    name: StringIds.Public,
  },
  // {
  //   id: PostVisibilities.Extended,
  //   name: StringIds.ExtendedCircle,
  // },
  {
    id: PostVisibilities.Private,
    name: StringIds.PrivateCircle
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
  @ViewChild('visibilitySelector') visibilitySelector: MatSelect;
  @ViewChild('circleSelector') circleSelector: MatSelect;
  visibilityOptions = VisibilityOptions;
  contextUsers: MinimumUser[] = [];

  @ViewChild('markdownEditor')
  editor: MarkdownEditorComponent;

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
    const _this = this;
    return VisibilityText[_this.post.visibility];
  }

  isPrivate() {
    return this.post.visibility === PostVisibilities.Private;
  }

  showCircleSelection() {
    const {circleSelector} = this;
    if (circleSelector) {
      circleSelector.open();
    }
  }

  onVisibilityChange(e) {
    this.post.visibility = e.value;
  }


  cancelPost() {
    const _this = this;
    _this.dialogRef.close();
  }

  onCircleChange() {

  }

  async publishPost() {
    const _this = this;
    _this.loading = true;
    try {
      let content = _this.editor.markdown;
      if (content) {
        content = content.trim();
      }
      if (!content) {
        _this.toastService.showToast('Empty post is not allowed!');
        return;
      }

      if (content.length > MAX_POST_LENGTH) {
        _this.toastService.showToast(`Post exceeded max length: ${MAX_POST_LENGTH}!`);
      }
      const {post} = _this;
      post.content = content;
      _this.editor.disableEditor();
      await post.save();
      _this.dialogRef.close();
      _this.toastService.showToast(`Post Succeed!`);
    } catch (e) {
      _this.toastService.showToast(e.error || e.message);
      _this.editor.enableEditor();
    } finally {
      _this.loading = false;
    }
  }
}

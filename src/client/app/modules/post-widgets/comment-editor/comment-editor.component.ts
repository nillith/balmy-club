import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {CommentData} from "../../../../../shared/interf";
import {PostEditorComponent} from "../post-editor/post-editor.component";
import {MarkdownEditorComponent} from "../../markdown/markdown-editor/markdown-editor.component";
import {StringIds} from '../../i18n/translations/string-ids';
import {IService} from "../../../services/i.service";
import {getIconMenuOption, IconMenuOption, MenuActions} from "../../../../constants";
import {CommentsApiService} from "../../../api/comments-api.service";
import {ToastService} from "../../../services/toast.service";
import {NullaryAsyncAction} from "../../../../utils/switch-debouncer";
import {CommentResponse} from "../../../../../shared/contracts";

@Component({
  selector: 'app-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrls: ['./comment-editor.component.scss']
})
export class CommentEditorComponent implements OnInit {

  readonly StringIds = StringIds;
  @Input() comment: CommentResponse;
  @Input() editMode = false;
  @Input() post: any;
  loading: boolean;
  menuBusy = false;
  enabledActions: IconMenuOption[] = [];
  plusAction: NullaryAsyncAction;
  unPlusAction: NullaryAsyncAction;

  private editor: MarkdownEditorComponent;

  @ViewChild('markdownEditor')
  set markdownEditor(editor: MarkdownEditorComponent) {
    this.editor = editor;
  }

  constructor(private postEditor: PostEditorComponent,
              public iService: IService,
              private toast: ToastService,
              private commentsApi: CommentsApiService) {
    const self = this;
    self.plusAction = async () => {
      await self.commentsApi.plusOne(self.comment.id);
      self.comment.plusedByMe = true;
    };

    self.unPlusAction = async () => {
      await self.commentsApi.unPlusOne(self.comment.id);
      self.comment.plusedByMe = false;
    };
  }

  ngOnInit() {
    const self = this;
    if (!this.post) {
      throw Error('post required!');
    }
    if (self.comment) {
      if (self.iService.isMyId(self.comment.authorId)) {
        self.enabledActions = getIconMenuOption([MenuActions.Edit, MenuActions.Delete]);
      }
    }
  }

  toggleEditMode() {
    const self = this;
    self.editMode = !self.editMode;
    self.postEditor.notifyParent();
  }

  createComment() {
    this.comment = {
      content: ''
    } as CommentResponse;
    this.toggleEditMode();
  }

  cancelEdit() {
    if (!this.comment.id) {
      this.comment = undefined;
    }

    this.toggleEditMode();
  }

  async saveEdit() {
    const self = this;
    self.loading = true;
    try {
      self.comment.content = self.editor.markdown;
      this.toggleEditMode();
      const comment = self.iService.createComment(self.post.id);
      comment.content = self.comment.content;
      await comment.save();
      if (!self.post.comments) {
        self.post.comments = [comment];
      } else {
        self.post.comments.push(comment);
      }
    } catch (e) {
      self.toast.showToast(e.error || e.mentionIds);
    } finally {
      self.loading = false;
    }
  }


  async onMenu(action: MenuActions) {
    const self = this;
    try {
      self.menuBusy = true;
      switch (action) {
        case MenuActions.Edit:
          console.log('edit');
          self.toggleEditMode();
          break;
        case MenuActions.Delete:
          console.log('delete');
          try {
            console.log(self.comment);
            if (self.comment.id) {
              console.log('remote delete!');
              await self.commentsApi.deleteCommentById(self.comment.id);
            }
            if (self.post.comments) {
              const index = self.post.comments.indexOf(self.comment);
              if (index !== -1) {
                self.post.comments.splice(index, 1);
              }
            }
          } catch (e) {
            self.toast.showToast(e.error || e.mentionIds);
          }
          break;
      }
    } finally {
      self.menuBusy = false;
    }

  }
}

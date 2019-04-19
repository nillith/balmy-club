import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {PostEditorComponent} from "../post-editor/post-editor.component";
import {MarkdownEditorComponent} from "../../markdown/markdown-editor/markdown-editor.component";
import {StringIds} from '../../i18n/translations/string-ids';
import {IService} from "../../../services/i.service";
import {getIconMenuOption, IconMenuOption, MenuActions} from "../../../../constants";
import {CommentsApiService} from "../../../api/comments-api.service";
import {ToastService} from "../../../services/toast.service";
import {NullaryAsyncAction} from "../../../../utils/switch-debouncer";
import {CommentResponse, MinimumUser} from "../../../../../shared/contracts";

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
  @Input() contextUsers: MinimumUser[] = [];

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
      ++self.comment.plusCount;
    };

    self.unPlusAction = async () => {
      await self.commentsApi.unPlusOne(self.comment.id);
      self.comment.plusedByMe = false;
      --self.comment.plusCount;
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
    const self = this;
    this.comment = {
      author: {
        id: self.iService.me.id,
        avatarUrl: self.iService.me.avatarUrl,
        nickname: self.iService.me.nickname,
      },
      content: ''
    } as CommentResponse;
    this.toggleEditMode();
  }

  cancelEdit() {
    const self = this;
    if (!self.comment.id) {
      self.comment = undefined;
    }

    self.toggleEditMode();
  }

  async saveEdit() {
    const self = this;
    self.loading = true;
    const isNew = !self.comment.id;
    try {
      self.comment.content = self.editor.markdown;
      this.toggleEditMode();
      const comment = self.iService.createComment(self.post.id);
      comment.content = self.comment.content;
      await comment.save();
      if (isNew) {
        if (!self.post.comments) {
          self.post.comments = [comment];
        } else {
          self.post.comments.push(comment);
        }
      }
    } catch (e) {
      self.toast.showToast(e.error || e.mentionIds);
    } finally {
      self.loading = false;
      if (isNew) {
        self.comment = undefined;
      }
    }
  }


  async onMenu(action: MenuActions) {
    const self = this;
    try {
      self.menuBusy = true;
      switch (action) {
        case MenuActions.Edit:
          self.toggleEditMode();
          break;
        case MenuActions.Delete:
          try {
            if (self.comment.id) {
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

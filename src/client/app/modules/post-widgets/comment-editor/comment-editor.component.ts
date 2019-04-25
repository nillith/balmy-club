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
    const _this = this;
    _this.plusAction = async () => {
      await _this.commentsApi.plusOne(_this.comment.id);
      _this.comment.plusedByMe = true;
      ++_this.comment.plusCount;
    };

    _this.unPlusAction = async () => {
      await _this.commentsApi.unPlusOne(_this.comment.id);
      _this.comment.plusedByMe = false;
      --_this.comment.plusCount;
    };
  }

  ngOnInit() {
    const _this = this;
    if (!this.post) {
      throw Error('post required!');
    }
    if (_this.comment && _this.iService.isMyId(_this.comment.authorId)) {
      _this.enabledActions = getIconMenuOption([MenuActions.Edit, MenuActions.Delete]);
    } else {
      _this.enabledActions = [];
    }
  }

  toggleEditMode() {
    const _this = this;
    _this.editMode = !_this.editMode;
    _this.postEditor.notifyParent();
  }

  createComment() {
    const _this = this;
    this.comment = {
      author: {
        id: _this.iService.me.id,
        avatarUrl: _this.iService.me.avatarUrl,
        nickname: _this.iService.me.nickname,
      },
      content: ''
    } as CommentResponse;
    this.toggleEditMode();
  }

  cancelEdit() {
    const _this = this;
    if (!_this.comment.id) {
      _this.comment = undefined;
    }

    _this.toggleEditMode();
  }

  async saveEdit() {
    const _this = this;
    _this.loading = true;
    const isNew = !_this.comment.id;
    try {
      _this.comment.content = _this.editor.markdown;
      this.toggleEditMode();
      if (isNew) {
        const comment = _this.iService.createComment(_this.post.id);
        comment.content = _this.comment.content;
        await comment.save();
        if (!_this.post.comments) {
          _this.post.comments = [comment];
        } else {
          _this.post.comments.push(comment);
        }
      } else {
        await _this.commentsApi.editMyComment(_this.comment.id, _this.comment.content);
      }
    } catch (e) {
      _this.toast.showToast(e.error || e.mentionIds);
    } finally {
      _this.loading = false;
      if (isNew) {
        _this.comment = undefined;
      }
    }
  }


  async onMenu(action: MenuActions) {
    const _this = this;
    try {
      _this.menuBusy = true;
      switch (action) {
        case MenuActions.Edit:
          _this.toggleEditMode();
          break;
        case MenuActions.Delete:
          try {
            if (_this.comment.id) {
              await _this.commentsApi.deleteMyComment(_this.comment.id);
            }
            if (_this.post.comments) {
              const index = _this.post.comments.indexOf(_this.comment);
              if (index !== -1) {
                _this.post.comments.splice(index, 1);
              }
            }
          } catch (e) {
            _this.toast.showToast(e.error || e.mentionIds);
          }
          break;
      }
    } finally {
      _this.menuBusy = false;
    }

  }
}

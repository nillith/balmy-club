import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {CommentData} from "../../../../../shared/interf";
import {PostEditorComponent} from "../post-editor/post-editor.component";
import {MarkdownEditorComponent} from "../../markdown/markdown-editor/markdown-editor.component";
import {StringIds} from '../../i18n/translations/string-ids';
import {IService} from "../../../services/i.service";

const enum PostActions {
  Edit,
  Delete,
  Mute,
  UnMute,
  Report,
}

const ActionOption = {
  [PostActions.Edit]: {
    action: PostActions.Edit,
    icon: 'edit',
    name: 'Edit'
  },
  [PostActions.Delete]: {
    action: PostActions.Delete,
    icon: 'delete',
    name: 'Delete'
  },
  [PostActions.UnMute]: {
    action: PostActions.UnMute,
    icon: 'notifications_off',
    name: 'Muted'
  },
  [PostActions.Mute]: {
    action: PostActions.Mute,
    icon: 'notifications_on',
    name: 'Mute'
  },
  [PostActions.Report]: {
    action: PostActions.Report,
    icon: 'report',
    name: 'Report'
  }
};

@Component({
  selector: 'app-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrls: ['./comment-editor.component.scss']
})
export class CommentEditorComponent implements OnInit {

  readonly StringIds = StringIds;
  @Input() comment: CommentData;
  @Input() editMode = false;
  @Input() post: any;
  loading: boolean;
  enabledActions = [PostActions.Edit, PostActions.Mute, PostActions.UnMute, PostActions.Delete, PostActions.Report].map(action => ActionOption[action]);

  private editor: MarkdownEditorComponent;

  @ViewChild('markdownEditor')
  set markdownEditor(editor: MarkdownEditorComponent) {
    this.editor = editor;
  }

  constructor(private postEditor: PostEditorComponent, public iService: IService) {

  }

  ngOnInit() {
    if (!this.post) {
      throw Error('post required!');
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
    };
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
      console.log(e);
    } finally {
      self.loading = false;
    }
  }
}

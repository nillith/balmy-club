import {Component, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {MarkdownEditorComponent} from "../../markdown/markdown-editor/markdown-editor.component";
import {StringIds} from '../../i18n/translations/string-ids';
import {PostsApiService} from "../../../api/posts-api.service";
import {noop} from "../../../../../shared/utils";
import {getIconMenuOption, MenuActions} from "../../../../constants";
import {NullaryAsyncAction} from "../../../../utils/switch-debouncer";
import {MinimumUser, PostResponse} from "../../../../../shared/contracts";

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.scss']
})
export class PostEditorComponent implements OnInit {
  readonly StringIds = StringIds;
  @Input() content: string;

  @Input() editMode = false;

  @Input() post: PostResponse;
  @Input() limitCommentHeight = false;
  @Input() showComments = true;
  plusAction: NullaryAsyncAction;
  unPlusAction: NullaryAsyncAction;



  notifyParent = noop;

  @ViewChild('markdownEditor')
  private editor: MarkdownEditorComponent;

  enabledActions = getIconMenuOption([MenuActions.Link]);

  constructor(private viewContainerRef: ViewContainerRef, private postApi: PostsApiService) {
    const _this = this;
    const hostComponent = _this.viewContainerRef["_view"].component;
    if (hostComponent.onChildSizeChange) {
      _this.notifyParent = () => {
        hostComponent.onChildSizeChange();
      };
    }
    _this.plusAction = async () => {
      await _this.postApi.plusOne(_this.post.id);
      _this.post.plusedByMe = true;
      ++_this.post.plusCount;
    };

    _this.unPlusAction = async () => {
      await _this.postApi.unPlusOne(_this.post.id);
      _this.post.plusedByMe = false;
      --_this.post.plusCount;
    };
  }

  ngOnInit() {
  }

  toggleEditMode() {
    const _this = this;
    _this.editMode = !_this.editMode;
    _this.notifyParent();
  }

  onMenu(action: MenuActions) {
    const _this = this;
    switch (action) {
      case MenuActions.Edit:
        _this.toggleEditMode();
        break;
      case MenuActions.Link:
        window.open(`p/${_this.post.id}`);
        break;
    }
  }

  cancelEdit() {
    this.toggleEditMode();
  }

  saveEdit() {
    const _this = this;
    _this.post.content = _this.editor.markdown;
    this.toggleEditMode();
  }

  async onShareClick() {

  }
}

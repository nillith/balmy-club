import {Component, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {MarkdownEditorComponent} from "../../markdown/markdown-editor/markdown-editor.component";
import {StringIds} from '../../i18n/translations/string-ids';
import {PostsApiService} from "../../../api/posts-api.service";
import {noop} from "../../../../../shared/utils";
import {getIconMenuOption, IconMenuOption, MenuActions} from "../../../../constants";
import {NullaryAsyncAction} from "../../../../utils/switch-debouncer";
import {PostResponse} from "../../../../../shared/contracts";
import {IService} from "../../../services/i.service";

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
  @Input() expandComments = false;
  plusAction: NullaryAsyncAction;
  unPlusAction: NullaryAsyncAction;
  menuBusy = false;
  hostComponent: any;


  notifyParent = noop;

  @ViewChild('markdownEditor')
  private editor: MarkdownEditorComponent;

  enabledActions: IconMenuOption[] = [];

  constructor(private viewContainerRef: ViewContainerRef, private postApi: PostsApiService, private iService: IService) {
    const _this = this;
    const hostComponent = _this.hostComponent = _this.viewContainerRef["_view"].component;
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
    const _this = this;
    const menuActions = [MenuActions.Link];
    if (_this.post.authorId === _this.iService.me.id) {
      menuActions.push(MenuActions.Delete, MenuActions.Edit);
    }
    _this.enabledActions = getIconMenuOption(menuActions);
  }

  toggleEditMode() {
    const _this = this;
    _this.editMode = !_this.editMode;
    _this.notifyParent();
  }

  async onMenu(action: MenuActions) {
    const _this = this;
    _this.menuBusy = true;
    try {
      switch (action) {
        case MenuActions.Edit:
          _this.toggleEditMode();
          break;
        case MenuActions.Link:
          window.open(`p/${_this.post.id}`);
          break;
        case MenuActions.Delete:
          await _this.postApi.deleteMyPost(_this.post.id)
          if (_this.hostComponent.removePostById) {
            _this.hostComponent.removePostById(_this.post.id);
          }
      }
    } finally {
      _this.menuBusy = false;
    }
  }

  cancelEdit() {
    this.toggleEditMode();
  }

  async saveEdit() {
    const _this = this;
    _this.post.content = _this.editor.markdown;
    await _this.postApi.editMyPost(_this.post.id, _this.post.content);
    this.toggleEditMode();
  }

  async onShareClick() {

  }
}

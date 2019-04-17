import {Component, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {PostData} from "../../../../../shared/interf";
import {MarkdownEditorComponent} from "../../markdown/markdown-editor/markdown-editor.component";
import {StringIds} from '../../i18n/translations/string-ids';
import {PostApiService} from "../../../api/post-api.service";
import {noop} from "../../../../../shared/utils";
import {getIconMenuOption, MenuActions} from "../../../../constants";

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.scss']
})
export class PostEditorComponent implements OnInit {
  readonly StringIds = StringIds;
  @Input() content: string;

  @Input() editMode = false;

  @Input() post: PostData;
  @Input() limitCommentHeight = false;
  @Input() showComments = true;

  notifyParent = noop;

  @ViewChild('markdownEditor')
  private editor: MarkdownEditorComponent;

  enabledActions = getIconMenuOption([MenuActions.Link]);

  constructor(private viewContainerRef: ViewContainerRef, private postApi: PostApiService) {
    const hostComponent = this.viewContainerRef["_view"].component;
    if (hostComponent.onChildSizeChange) {
      this.notifyParent = () => {
        hostComponent.onChildSizeChange();
      };
    }
  }

  ngOnInit() {
    console.log(this.post);
  }

  toggleEditMode() {
    const self = this;
    self.editMode = !self.editMode;
    self.notifyParent();
  }

  onMenu(action: MenuActions) {
    const self = this;
    switch (action) {
      case MenuActions.Edit:
        self.toggleEditMode();
        break;
      case MenuActions.Link:
        window.open(`p/${self.post.id}`);
        break;
    }
  }

  cancelEdit() {
    this.toggleEditMode();
  }

  saveEdit() {
    const self = this;
    self.post.content = self.editor.markdown;
    this.toggleEditMode();
  }

  async onPlusClick() {
    const self = this;
    await self.postApi.plusOne(self.post.id);
  }

  async onShareClick() {
    const self = this;
    await self.postApi.unPlusOne(self.post.id);
  }
}

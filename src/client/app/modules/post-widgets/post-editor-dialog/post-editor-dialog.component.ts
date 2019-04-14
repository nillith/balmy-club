import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {PostModel} from "../../../models/post.model";
import {IService} from "../../../api/i.service";
import {PostVisibilities} from "../../../../../shared/interf";

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
  PostVisibilities = PostVisibilities;
  @ViewChild('visibilitySelector') visibilitySelector;
  visibilityOptions = VisibilityOptions;

  circleSelectOptions = [
    {
      id: 'oaeuaoeueoaua',
      name: 'Friend',
    },
    {
      id: 'aoeuoaeu',
      name: 'Foe',
    },
    {
      id: 'oeuaoeuoeuoeuoaeu',
      name: 'Following'
    }
  ];

  constructor(public dialogRef: MatDialogRef<PostEditorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: { post: PostModel },
              public iService: IService) {
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
}

import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ToastService} from "../../services/toast.service";
import {IService} from "../../services/i.service";
import {ActivatedRoute} from "@angular/router";
import {PostModel} from "../../models/post.model";
import {isValidStringId} from "../../../../shared/utils";
import {PostsApiService} from "../../api/posts-api.service";

@Component({
  selector: 'app-p',
  templateUrl: './p.component.html',
  styleUrls: ['./p.component.scss']
})
export class PostPageComponent implements OnInit {
  postId?: string;
  post?: PostModel;

  constructor(private route: ActivatedRoute, private iService: IService, private toastService: ToastService, private http: HttpClient, private postApi: PostsApiService) {
  }

  ngOnInit() {
    const _this = this;
    _this.route.params.subscribe(async (params) => {
      try {
        const postId = params['postId'];
        _this.postId = postId;
        if (!isValidStringId(_this.postId)) {
          return _this.toastService.showToast('unknown post');
        }
        _this.post = await _this.postApi.getPostById(_this.postId);
      } catch (e) {
        _this.toastService.showToast(e.error || e.message);
      }
    });
  }

}

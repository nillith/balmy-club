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
    const self = this;
    self.route.params.subscribe(async (params) => {
      try {
        const postId = params['postId'];
        self.postId = postId;
        if (!isValidStringId(self.postId)) {
          return self.toastService.showToast('unknown post');
        }
        self.post = await self.postApi.getPostById(self.postId);
        // self.user.id = postId;
        // self.updateCircleStatus();
        // self.loading = false;
        // self.streamFetcher = new UserStreamFetcher(self.http, self.user, self.iService);
//        self.updateExtraMenuItems();
      } catch (e) {
        self.toastService.showToast(e.error || e.message);
      }
    });
  }

}

import { Component, OnInit } from '@angular/core';
import {
  DefaultStreamFetcher,
  StreamFetcher
} from "../../modules/post-widgets/post-stream-view/post-stream-view.component";
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../../constants";

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {
  streamFetcher?: StreamFetcher;
  constructor(private http: HttpClient) {
    this.streamFetcher = new DefaultStreamFetcher(http, API_URLS.DISCOVER);
  }

  ngOnInit() {
  }

}

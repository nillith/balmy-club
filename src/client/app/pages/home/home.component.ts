import {Component, OnInit} from '@angular/core';
import {
  DefaultStreamFetcher,
  StreamFetcher
} from "../../modules/post-widgets/post-stream-view/post-stream-view.component";
import {HttpClient} from "@angular/common/http";
import {IService} from "../../services/i.service";
import {API_URLS} from "../../../constants";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  streamFetcher?: StreamFetcher;

  constructor(private http: HttpClient, private iService: IService) {
    this.streamFetcher = new DefaultStreamFetcher(http, API_URLS.HOME_TIMELINE, iService);
  }

  ngOnInit() {

  }
}

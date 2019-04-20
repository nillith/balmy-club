import {ApplicationRef, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_URLS, SHARED_WORKER_URL} from "../../constants";
import {MinimumUser, NotificationResponse} from "../../../shared/contracts";
import {NullaryAsyncAction} from "../../utils/switch-debouncer";
import _ from 'lodash';
import {ToastService} from "../services/toast.service";
import {environment} from "../../environments/environment";
import {getAccessToken} from "../../utils/auth";
import {IPCMessageTypes, PING, PONG} from "../../../shared/constants";

declare namespace SharedWorker {
  interface AbstractWorker extends EventTarget {
    onerror: (ev: ErrorEvent) => any;
  }

  export interface SharedWorker extends AbstractWorker {
    port: MessagePort;
  }

  export interface SharedWorkerGlobalScope extends Worker {
    onconnect: (event: MessageEvent) => void;
  }
}

declare var SharedWorker: {
  prototype: SharedWorker.SharedWorker;
  new(stringUrl: string, name?: string): SharedWorker.SharedWorker;
};


export interface NotificationData extends NotificationResponse {
  subject: MinimumUser;
}


@Injectable({
  providedIn: 'root'
})
export class NotificationsApiService {
  unreadCount = 0;
  notifications: NotificationData[] = [];
  fetchTask: NullaryAsyncAction;
  loading = false;
  messagePort?: MessagePort;

  constructor(private http: HttpClient, private toast: ToastService, private appRef: ApplicationRef) {
    const _this = this;
    _this.fetchTask = _.throttle(async () => {
      if (_this.loading) {
        return;
      }
      try {
        _this.loading = true;
        await _this.getUnreadCount();
        if (_this.unreadCount) {
          _this.notifications = await _this.getNotifications();
        }
      } catch (e) {
        _this.toast.showToast(e.error || e.message);
      } finally {
        _this.loading = false;
      }
    }, 1000);

    window.addEventListener('beforeunload', _this.beforeUnload.bind(_this));

  }

  private beforeUnload() {
    const _this = this;
    if (_this.messagePort) {
      _this.messagePort.close();
      _this.messagePort = undefined;
    }
  }

  private onWorkerMessage(msgStr: string) {
    const _this = this;
    const msg = JSON.parse(msgStr);
    if (msg && _this[msg.type]) {
      _this[msg.type](msg.data);
      _this.appRef.tick();
    }
  }

  onLogin() {
    const _this = this;
    const worker = new SharedWorker(SHARED_WORKER_URL);
    _this.messagePort = worker.port;
    _this.messagePort.onmessage = function(e: MessageEvent) {
      if (e.data === PING) {
        _this.messagePort.postMessage(PONG);
      } else {
        console.log(e.data);
        _this.onWorkerMessage(e.data);
      }
    };
    _this[IPCMessageTypes.Token]();
  }

  onLogout() {
    const _this = this;
    if (_this.messagePort) {
      _this.messagePort.postMessage(JSON.stringify({
        type: IPCMessageTypes.Logout,
      }));
      setTimeout(() => {
        _this.messagePort.close();
        _this.messagePort = undefined;
      });
    }
  }

  [IPCMessageTypes.Token](data?: any) {
    const _this = this;
    _this.messagePort.postMessage(JSON.stringify({
      type: IPCMessageTypes.Token,
      data: {
        url: environment.wsUrl,
        token: getAccessToken()
      }
    }));
  }

  [IPCMessageTypes.Sync](data: any) {
    const _this = this;
    _this.unreadCount = data.unreadCount;
    _this.notifications = data.notifications;
  }

  [IPCMessageTypes.Notification](data: any) {
    const _this = this;
    data.subject = {
      id: data.subjectId,
      nickname: data.subjectNickname,
      avatarUrl: data.subjectAvatarUrl
    };
    _this.notifications.push(data as NotificationData);
    ++_this.unreadCount;
  }

  [IPCMessageTypes.Read](data: any) {
    const _this = this;
    const id = data as string;
    const notification = _this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      --_this.unreadCount;
    }
  }

  private async getNotifications(): Promise<NotificationData[]> {
    const notifications = await this.http.get(API_URLS.NOTIFICATIONS).toPromise() as NotificationData[];
    for (let n of notifications) {
      n.subject = {
        id: n.subjectId,
        nickname: n.subjectNickname,
        avatarUrl: n.subjectAvatarUrl
      };
    }
    return notifications;
  }

  fetchNotification() {
    this.fetchTask();
  }

  async getUnreadCount() {
    const _this = this;
    const data = await _this.http.get(`${API_URLS.NOTIFICATIONS}/unread-count`, {responseType: 'text'}).toPromise();
    return _this.unreadCount = parseFloat(data);
  }

  async markNotificationAsReadById(notificationId: string) {
    const _this = this;
    await _this.http.post(`${API_URLS.NOTIFICATIONS}/${notificationId}/read`, undefined, {responseType: 'text'}).toPromise();
    --_this.unreadCount;
    _this.messagePort.postMessage(JSON.stringify({
      type: IPCMessageTypes.Read,
      data: notificationId
    }));
  }
}

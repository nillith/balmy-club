import WebSocket from 'ws';
import config from '../config';
import {authService} from "./auth.service";
import {$contextExtraId, $contextId, $id, $objectId, $subjectId, INVALID_NUMERIC_ID} from "./obfuscator.service";
import {AUTH, PING, PONG, RemoteMessageTypes} from "../../shared/constants";
import {
  assertValidRawNotificationMessage,
  FullNotificationRecord,
  NotificationModel,
  RawNotificationMessage
} from "../models/notification.model";
import {Activity} from "../../shared/interf";
import {isValidTimestamp} from "../../shared/utils";
import {devOnly, isNumericId} from "../utils/index";
import {UserModel} from "../models/user.model";
import isValidContextType = Activity.isValidContextType;

const $userId = Symbol();
const $authTimeoutId = Symbol();
const $pingTimeoutId = Symbol();
const $heartbeatIntervalId = Symbol();
const $messageHandlers = Symbol();
const $isAlive = Symbol();

interface MessageHandlers {
  [index: string]: (client: WSClient, data: any) => void;

  [index: number]: (client: WSClient, data: any) => void;
}

export interface WSClient extends WebSocket {
  [$userId]?: number;
  [$authTimeoutId]?: NodeJS.Timer;
  [$pingTimeoutId]?: NodeJS.Timer;
  [$heartbeatIntervalId]?: NodeJS.Timer;
  [$messageHandlers]?: MessageHandlers;
  [$isAlive]?: boolean;
}

const sendCallback = (err) => {
  if (err) {
    console.log(err);
  }
};

function sendString(client: WSClient, data: string) {
  client.send(data, sendCallback);
}

function sendStringIfAlive(client: WSClient, data: string) {
  if (client[$isAlive]) {
    sendString(client, data);
  }
}


const messageHandlers: MessageHandlers = {
  async [RemoteMessageTypes.Sync](client: WSClient, data: any) {
    const userId = client[$userId];
    const unreadCountPromise = NotificationModel.getUnreadCountForUser(userId!);
    const notificationsPromise = NotificationModel.getUserNotifications(userId!);
    const msg = {
      type: RemoteMessageTypes.Sync,
      data: {
        unreadCount: await unreadCountPromise,
        notifications: await notificationsPromise,
      }
    };
    if (client[$isAlive]) {
      sendString(client, JSON.stringify(msg));
    }
  }
};


const clientRegistry = new Map<number, WSClient>();

const AUTH_TIMEOUT = 30 * 1000;
const PING_TIMEOUT = 30 * 1000;
const HEARTBEAT_INTERVAL = PING_TIMEOUT * 2;


function cleanup(client: WSClient) {
  client[$isAlive] = false;
  clearAuthTimeout(client);
  clearPingTimeout(client);
  if (client[$userId]) {
    clientRegistry.delete(client[$userId]!);
    client[$userId] = undefined;
  }
  if (client[$heartbeatIntervalId]) {
    clearInterval(client[$heartbeatIntervalId]!);
    client[$heartbeatIntervalId] = undefined;
  }
}

function cleanupAndTerminate(client: WSClient) {
  cleanup(client);
  client.terminate();
}

function pingTimeout(client: WSClient) {
  client[$pingTimeoutId] = undefined;
  cleanupAndTerminate(client);
}

function clearPingTimeout(client: WSClient) {
  if (client[$pingTimeoutId]) {
    clearTimeout(client[$pingTimeoutId]!);
    client[$pingTimeoutId] = undefined;
  }
}

function heartbeat(client: WSClient) {
  client[$pingTimeoutId] = setTimeout(pingTimeout, PING_TIMEOUT, client);
  sendString(client, PING);
}

function setHeartbeatInterval(client: WSClient) {
  client[$heartbeatIntervalId] = setInterval(heartbeat, HEARTBEAT_INTERVAL, client);
}

function authTimeout(client: WSClient) {
  client[$authTimeoutId] = undefined;
  cleanupAndTerminate(client);
}

function clearAuthTimeout(client: WSClient) {
  if (client[$authTimeoutId]) {
    clearTimeout(client[$authTimeoutId]!);
  }
}

const onMessage = (function() {
  function onAuthenticatedClientMessage(this: WSClient, message: WebSocket.Data) {
    const client = this;
    switch (message) {
      case PING:
        sendString(client, PONG); // fallthrough
      case PONG:
        clearPingTimeout(client);
        break;
      default:
        const handlers = client[$messageHandlers];
        if (handlers) {
          const msg = JSON.parse(message as string);
          const handler = handlers[msg.type];
          if (handler) {
            handler(client, msg);
          }
        }
    }
  }

  return async function(this: WSClient, message: WebSocket.Data) {
    const client = this;
    client.removeListener('message', onMessage);
    const userId = await authService.decodeUserIdFromToken(message);
    if (INVALID_NUMERIC_ID === userId) {
      cleanupAndTerminate(client);
    } else {
      clearAuthTimeout(client);
      client[$isAlive] = true;
      client[$userId] = userId;
      client[$messageHandlers] = messageHandlers;
      clientRegistry.set(userId, client);
      client.on('message', onAuthenticatedClientMessage);
      setHeartbeatInterval(client);
      sendString(client, AUTH);
    }
  };
})();

function onClose(this: WSClient) {
  cleanup(this);
}

function onConnection(client: WSClient) {
  client[$authTimeoutId] = setTimeout(authTimeout, AUTH_TIMEOUT, client);
  client.on('message', onMessage);
  client.on('close', onClose);
}

export interface RawAlikeNotifications {
  notificationIds: number[];
  recipientIds: number[];
  subjectId: number;
  contextId: number;
  contextType: Activity.ContextTypes;
  timestamp: number;
  contextExtraId?: number;
  clients?: WSClient[];
  objectType: Activity.ObjectTypes;
  actionType: number;
}

export const assertValidRawAlikeNotifications = devOnly(function(data: any) {
  console.assert(isValidTimestamp(data.timestamp), `invalid timestamp: ${data.timestamp}`);
  console.assert(isNumericId(data.contextId), `invalid contextId: ${data.contextId}`);
  console.assert(isValidContextType(data.contextType), `invalid contextType: ${data.contextType}`);
  if (data.contextType === Activity.ContextTypes.Comment) {
    console.assert(isNumericId(data.contextExtraId), `invalid contextExtraId: ${data.contextExtraId}`);
  }
  console.assert(Activity.isValidActivity(data.objectType, data.actionType, data.contextType), `invalid activity: objectType:${data.objectType}, actionType:${data.actionType}, contextType:${data.contextType}`);
  console.assert(data.notificationIds.length, `no notification ids`);
  console.assert(data.notificationIds.length === data.recipientIds.length, `id number mismatch notificationId:activityId ${data.notificationIds.length}:${data.recipientIds.length}`);
  for (const id of data.notificationIds) {
    console.assert(isNumericId(id), `invalid notification id ${id}`);
  }
  for (const id of data.recipientIds) {
    console.assert(isNumericId(id), `invalid recipient id ${id}`);
  }
});

export function filterOfflineUsers(alikes: RawAlikeNotifications): RawAlikeNotifications | undefined {
  const {notificationIds, recipientIds, subjectId, contextId, contextType, timestamp, contextExtraId, objectType, actionType} = alikes;

  const linked: RawAlikeNotifications = {
    notificationIds: [],
    recipientIds: [],
    subjectId,
    contextId,
    contextType,
    timestamp,
    contextExtraId,
    objectType,
    actionType,
    clients: [],
  };

  for (let i = 0; i < recipientIds.length; ++i) {
    const recipientId = recipientIds[i];
    const client = clientRegistry.get(recipientId);
    if (!client) {
      continue;
    }
    linked.recipientIds.push(recipientId);
    linked.clients!.push(client!);
    linked.notificationIds.push(notificationIds[i]);
  }
  if (linked.clients!.length) {
    return linked;
  }
}

export interface NotificationAndClient {
  client: WSClient;
  notification: FullNotificationRecord;
}


export const assertValidPrepareForSendParams = devOnly(function(data: any) {
  assertValidRawAlikeNotifications(data);
  console.assert(data.clients && data.clients.length, `no clients`);
});

export async function prepareForSend(alikes: RawAlikeNotifications) {
  assertValidPrepareForSendParams(alikes);
  const result: NotificationAndClient[] = [];
  const {notificationIds, recipientIds, subjectId, contextId, contextType, timestamp, contextExtraId, clients, objectType, actionType} = alikes;

  const subject = await UserModel.findNicknameAvatarById(subjectId);
  if (!subject) {
    return result;
  }

  for (let i = 0; i < notificationIds.length; ++i) {
    const notification = Object.create(FullNotificationRecord.prototype);
    notification[$id] = notificationIds[i];
    notification[$contextExtraId] = contextExtraId;
    notification[$subjectId] = subjectId;
    notification[$objectId] = recipientIds[i];
    notification[$contextId] = contextId;
    notification.objectType = objectType;
    notification.actionType = actionType;
    notification.timestamp = timestamp;
    notification.contextType = contextType;
    notification.subjectNickname = subject!.nickname;
    notification.subjectAvatarUrl = subject!.avatarUrl;
    result.push({
      client: clients![i],
      notification
    });
  }
  return result;
}

class MessengerService {
  private wss: WebSocket.Server;

  constructor() {
    const wss = this.wss = new WebSocket.Server({
      port: config.webSocketPort,
      maxPayload: 2048
    });

    wss.on('connection', onConnection);
  }

  close(cb) {
    this.wss.close(cb);
  }

  postOneNotification(n: NotificationAndClient) {
    sendStringIfAlive(n.client, JSON.stringify({
      type: RemoteMessageTypes.Notification,
      data: n.notification
    }));
  }

  postNotifications(items: NotificationAndClient[]) {
    for (const item of items) {
      this.postOneNotification(item);
    }
  }

  async postRawNotification(rawMessage: RawNotificationMessage) {
    const _this = this;
    assertValidRawNotificationMessage(rawMessage);
    const client = clientRegistry.get(rawMessage.rawNotification.recipientId);
    if (!client) {
      return;
    }
    const notification = await FullNotificationRecord.fromRawNotificationMessage(rawMessage);
    if (notification) {
      _this.postOneNotification({client, notification});
    }
  }

  async postRawAlikeNotifications(mentionMessages: RawAlikeNotifications) {
    assertValidRawAlikeNotifications(mentionMessages);
    const linked = filterOfflineUsers(mentionMessages);
    if (!linked) {
      return;
    }
    this.postNotifications(await prepareForSend(linked));
  }

}

export const messengerService = new MessengerService();

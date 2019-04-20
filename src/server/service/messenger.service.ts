import WebSocket from 'ws';
import config from '../config';
import {authService} from "./auth.service";
import {INVALID_NUMERIC_ID} from "./obfuscator.service";
import {AUTH, IPCMessageTypes, PING, PONG} from "../../shared/constants";
import {
  assertValidRawNotificationMessage,
  NotificationDataRecord,
  NotificationModel,
  RawNotificationMessage
} from "../models/notification.model";

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

interface WSClient extends WebSocket {
  [$userId]?: number;
  [$authTimeoutId]?: NodeJS.Timer;
  [$pingTimeoutId]?: NodeJS.Timer;
  [$heartbeatIntervalId]?: NodeJS.Timer;
  [$messageHandlers]?: MessageHandlers;
}

const sendCallback = (err) => {
  if (err) {
    console.log(err);
  }
};

function sendString(client: WSClient, data: string) {
  client.send(data, sendCallback);
}


const messageHandlers: MessageHandlers = {
  async [IPCMessageTypes.Sync](client: WSClient, data: any) {
    const userId = client[$userId];
    const unreadCountPromise = NotificationModel.getUnreadCountForUser(userId!);
    const notificationsPromise = NotificationModel.getUserNotifications(userId!);
    const msg = {
      type: IPCMessageTypes.Sync,
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
  client[$isAlive] = true;
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

  postOneNotification(client: WSClient, notification: NotificationDataRecord) {
    sendString(client, JSON.stringify({
      type: IPCMessageTypes.Notification,
      data: notification
    }));
  }

  async postRawNotification(rawMessage: RawNotificationMessage) {
    const _this = this;
    assertValidRawNotificationMessage(rawMessage);
    const client = clientRegistry.get(rawMessage.rawNotification.recipientId);
    if (!client) {
      return;
    }
    const notification = await NotificationDataRecord.fromRawNotificationMessage(rawMessage);
    if (notification) {
      _this.postOneNotification(client, notification);
    }
  }
}

export const messengerService = new MessengerService();

const PING = 'PING'
const PONG = 'PONG'
const AUTH = 'AUTH'

const PORTS = []
let webSocketClient

let workerClosing = false
let synced = false

const {openWebSocket, closeWebSocket} = (function () {
  const AUTH_TIMEOUT = 30 * 1000
  const HEARTBEAT_INTERVAL = 60 * 1000

  const $authTimeoutId = Symbol()
  const $pinged = Symbol()
  const $heartbeatIntervalId = Symbol()

  function cleanup (ws) {
    if (ws[$heartbeatIntervalId]) {
      clearInterval(ws[$heartbeatIntervalId])
      ws[$heartbeatIntervalId] = undefined
    }
    webSocketClient = undefined
  }

  function closeWebSocket (ws) {
    cleanup(ws)
    ws.close()
  }

  function heartbeat (ws) {
    if (!ws[$pinged]) {
      closeWebSocket(ws)
    } else {
      ws[$pinged] = false
    }
  }

  const onMessage = (function () {
    function onAuthenticatedClientMessage (msgEvent) {

      const _this = this
      switch (msgEvent.data) {
        case PING:
          _this.send(PONG) // fallthrough
        case PONG:
          _this[$pinged] = true
          break
        default:
          onWebSocketMessage(msgEvent.data)
      }
    }

    return function (msgEvent) {
      const _this = this
      clearTimeout(_this[$authTimeoutId])
      _this[$authTimeoutId] = undefined
      if (msgEvent.data === AUTH) {
        _this.onmessage = onAuthenticatedClientMessage
        onWebSocketAuthenticated(_this)
        _this[$heartbeatIntervalId] = setInterval(heartbeat, HEARTBEAT_INTERVAL, _this)
      } else {
        closeWebSocket(_this)
      }
    }
  })()

  function openWebSocket (gateway, token) {
    webSocketClient = new WebSocket(gateway)

    webSocketClient.onopen = function () {
      const _this = this
      _this[$authTimeoutId] = setTimeout(closeWebSocket, AUTH_TIMEOUT, _this)
      webSocketClient.send(token)
    }

    webSocketClient.onmessage = onMessage

    webSocketClient.onclose = function () {
      cleanup(this)
      onWebSocketClose()
    }
  }

  return {
    openWebSocket,
    closeWebSocket
  }
})()

self.onconnect = (function () {

  function cleanup (port) {
    const index = PORTS.indexOf(port)
    if (-1 !== index) {
      PORTS.splice(index, 1)
    }
    stopHeartbeat(port)
    clearPingTimeout(port)
  }

  function cleanupAndClosePort (port) {
    cleanup(port)
    port.close()
  }

  function pingTimeout (port) {
    port[$pingTimeoutId] = undefined
    cleanupAndClosePort(port)
  }

  const $pingTimeoutId = Symbol()
  const $heartbeatIntervalId = Symbol()
  const PING_TIMEOUT = 30 * 1000
  const HEARTBEAT_INTERVAL = PING_TIMEOUT * 2

  function clearPingTimeout (port) {
    if (port[$pingTimeoutId]) {
      clearTimeout(port[$pingTimeoutId])
      port[$pingTimeoutId] = undefined
    }
  }

  function heartbeat (port) {
    port[$pingTimeoutId] = setTimeout(pingTimeout, PING_TIMEOUT, port)
    port.postMessage(PING)
  }

  function setHeartbeatInterval (port) {
    port[$heartbeatIntervalId] = setInterval(heartbeat, HEARTBEAT_INTERVAL, port)
  }

  function stopHeartbeat (port) {
    if (port[$heartbeatIntervalId]) {
      clearInterval(port[$heartbeatIntervalId])
      port[$heartbeatIntervalId] = undefined
    }
  }

  return function (e) {
    const port = e.ports[0]
    PORTS.push(port)
    setHeartbeatInterval(port)

    port.onmessage = function (e) {
      const _this = this
      if (PONG === e.data) {
        clearPingTimeout(_this)
      } else {
        onPortMessage(port, e.data)
      }
    }

    port.addEventListener('close', function () {
      cleanup(port)
      if (!PORTS.length) {
        workerClosing = true
        if (webSocketClient) {
          webSocketClient.close()
        }
      }
    })
  }
})()

const NotificationsStore = {
  unreadCount: 0,
  notifications: [],
}

const IPCMessageTypes = {
  // client side only start
  Token: 1,
  Read: 2,
  Logout: 3,
  // client side only end

  Sync: 100,
  Notification: 101,
}

function broadcast (msg) {
  for (const p of PORTS) {
    p.postMessage(msg)
  }
}

function broadcastOther (msg, port) {
  for (const p of PORTS) {
    if (p !== port) {
      p.postMessage(msg)
    }
  }
}

const WebSocketMessageHandlers = {
  [IPCMessageTypes.Sync]: function (data) {
    NotificationsStore.unreadCount = data.unreadCount
    NotificationsStore.notifications = data.notifications
  },
  [IPCMessageTypes.Notification]: function (data) {

    NotificationsStore.notifications.push(data)
  }
}

function onWebSocketMessage (msgStr) {
  const msg = JSON.parse(msgStr)
  const handler = WebSocketMessageHandlers[msg.type]
  if (handler) {
    handler(msg.data)
  }
  broadcast(msgStr)
}

let reConnectDelay
let reConnecting
let reConnectPortIndex

function resetReConnectParams () {
  reConnectDelay = 1000
  reConnecting = false
  reConnectPortIndex = 0
}

resetReConnectParams()

function onWebSocketAuthenticated (ws) {
  resetReConnectParams()
  if (!synced) {
    webSocketClient.send(JSON.stringify({
      type: IPCMessageTypes.Sync
    }))
  }
}

function closeWorker () {
  if (webSocketClient) {
    closeWebSocket(webSocketClient);
  }
  self.close()
}

function tryReConnect () {
  if (reConnecting) {
    return
  }
  reConnecting = true
  setTimeout(function () {
    if (!PORTS.length) {
      closeWorker()
    }
    if (reConnectPortIndex === PORTS.length) {
      reConnectPortIndex = 0
    }
    const port = PORTS[reConnectPortIndex]
    if (port) {
      port.postMessage(JSON.stringify({
        type: IPCMessageTypes.Token
      }))
    }
    ++reConnectPortIndex
    reConnecting = false
  }, reConnectDelay)
  reConnectDelay *= 3
}

function onWebSocketClose () {
  if (workerClosing || !PORTS.length) {
    synced = false
    closeWorker()
  } else if (PORTS.length) {
    tryReConnect()
  }
}

const PortMessageHandlers = {
  [IPCMessageTypes.Token] (port, msg) {
    if (!webSocketClient) {
      openWebSocket(msg.url, msg.token)
    }
  },
  [IPCMessageTypes.Sync] (port, msg) {
    port.postMessage(JSON.stringify({
      type: IPCMessageTypes.Sync,
      data: NotificationsStore
    }))
  },
  [IPCMessageTypes.Read] (port, id) {
    const index = NotificationsStore.notifications.findIndex((n) => {
      return n.id === id
    })

    if (-1 === index) {
      return
    }

    NotificationsStore.notifications.splice(index, 1)
    --NotificationsStore.unreadCount
    const msgStr = JSON.stringify({
      type: IPCMessageTypes.Read,
      data: id
    })
    broadcastOther(msgStr, port)
  },
  [IPCMessageTypes.Logout] () {
    closeWorker()
  }
}

function onPortMessage (port, msgStr) {
  const msg = JSON.parse(msgStr)
  const handler = PortMessageHandlers[msg.type]
  if (handler) {
    handler(port, msg.data)
  }
}


import { BaseDriver, DEFAULT_WS_PATHNAME_PREFIX } from 'appium/driver';
import _ from 'lodash';
import WebSocket from 'ws';
import { BIDI_EVENT_NAME } from './bidi/constants';
import { makeLogEntryAddedEvent } from './bidi/models';
import { NATIVE_WIN } from './context/helpers';

const COLOR_CODE_PATTERN = /\u001b\[(\d+(;\d+)*)?m/g; // eslint-disable-line no-control-regex
export const GET_SERVER_LOGS_FEATURE = 'get_server_logs';

/**
 * @param {string} sessionId
 * @returns {string}
 */
const WEBSOCKET_ENDPOINT = (sessionId) =>
  `${DEFAULT_WS_PATHNAME_PREFIX}/session/${sessionId}/appium/device/hilog`;

/**
 *
 * @see {@link https://github.com/SeleniumHQ/selenium/blob/0d425676b3c9df261dd641917f867d4d5ce7774d/java/client/src/org/openqa/selenium/logging/LogEntry.java}
 * @param {number} timestamp
 * @param {string} message
 * @param {string} [level='ALL']
 * @returns {import ('./types').LogEntry}
 */
function toLogRecord(timestamp, message, level = 'ALL') {
  return {
    timestamp,
    // @ts-ignore It's ok
    level,
    message,
  };
}

/**
 *
 * @param {Object} x
 * @returns {import ('./types').LogEntry}
 */
export function nativeLogEntryToSeleniumEntry(x) {
  const msg = _.isEmpty(x.prefix) ? x.message : `[${x.prefix}] ${x.message}`;
  return toLogRecord(
    /** @type {any} */(x).timestamp ?? Date.now(),
    _.replace(msg, COLOR_CODE_PATTERN, '')
  );
}

export const supportedLogTypes = {
  hilog: {
    description: 'Harmony device logs',
    /**
     *
     * @param {import('../driver').HarmonyDriver} self
     * @returns
     */
    getter: (self) => self.driver.hilog.getLogs(),
  },
  server: {
    description: 'Appium server logs',
    /**
     *
     * @param {import('../driver').HarmonyDriver} self
     * @returns
     */
    getter: (self) => {
      self.assertFeatureEnabled(GET_SERVER_LOGS_FEATURE);
      return self.log.unwrap().record.map(nativeLogEntryToSeleniumEntry);
    },
  },
};

/**
 * https://w3c.github.io/webdriver-bidi/#event-log-entryAdded
 *
 * @template {import('node:events').EventEmitter} EE
 * @this {HarmonyDriver}
 * @param {EE} logEmitter
 * @param {BiDiListenerProperties} properties
 * @returns {[EE, import ('./types').LogListener]}
 */
export function assignBiDiLogListener(logEmitter, properties) {
  const {
    type,
    context = NATIVE_WIN,
    srcEventName = 'output',
    entryTransformer,
  } = properties;
  const listener = (/** @type {import('./types').LogEntry} */ logEntry) => {
    const finalEntry = entryTransformer ? entryTransformer(logEntry) : logEntry;
    this.eventEmitter.emit(BIDI_EVENT_NAME, makeLogEntryAddedEvent(finalEntry, context, type));
  };
  logEmitter.on(srcEventName, listener);
  return [logEmitter, listener];
}

/**
 * @this {HarmonyDriver}
 * @returns {Promise<void>}
 */
export async function startLogsBroadcast() {
  const server = /** @type {import('@appium/types').AppiumServer} */ (this.server);
  const pathname = WEBSOCKET_ENDPOINT(/** @type {string} */(this.sessionId));
  if (!_.isEmpty(await server.getWebSocketHandlers(pathname))) {
    this.log.debug(`The hilog broadcasting web socket server is already listening at ${pathname}`);
    return;
  }

  this.log.info(
    `Starting hilog broadcasting on web socket server ` +
    `${JSON.stringify(server.address())} to ${pathname}`,
  );
  // https://github.com/websockets/ws/blob/master/doc/ws.md
  const wss = new WebSocket.Server({
    noServer: true,
  });
  wss.on('connection', (ws, req) => {
    if (req) {
      const remoteIp = _.isEmpty(req.headers['x-forwarded-for'])
        ? req.socket?.remoteAddress
        : req.headers['x-forwarded-for'];
      this.log.debug(`Established a new hilog listener web socket connection from ${remoteIp}`);
    } else {
      this.log.debug('Established a new hilog listener web socket connection');
    }

    if (_.isEmpty(this._hilogWebsocketListener)) {
      this._hilogWebsocketListener = (logRecord) => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(logRecord.message);
        }
      };
    }
    this.driver.hilog.setHilogListener(this._hilogWebsocketListener);

    ws.on('close', (code, reason) => {
      if (!_.isEmpty(this._hilogWebsocketListener)) {
        try {
          this.driver.hilog.removeHilogListener(this._hilogWebsocketListener);
        } catch { }
        this._hilogWebsocketListener = undefined;
      }

      let closeMsg = 'Hilog listener web socket is closed.';
      if (!_.isEmpty(code)) {
        closeMsg += ` Code: ${code}.`;
      }
      if (!_.isEmpty(reason)) {
        closeMsg += ` Reason: ${reason.toString()}.`;
      }
      this.log.debug(closeMsg);
    });
  });
  await server.addWebSocketHandler(pathname, /** @type {import('@appium/types').WSServer} */(wss));
}

/**
 * @this {HarmonyDriver}
 * @returns {Promise<void>}
 */
export async function stopLogsBroadcast() {
  const pathname = WEBSOCKET_ENDPOINT(/** @type {string} */(this.sessionId));
  const server = /** @type {import('@appium/types').AppiumServer} */ (this.server);
  if (_.isEmpty(await server.getWebSocketHandlers(pathname))) {
    return;
  }

  this.log.debug(
    `Stopping hilog broadcasting on web socket server ` +
    `${JSON.stringify(server.address())} to ${pathname}`,
  );
  await server.removeWebSocketHandler(pathname);
}

/**
 * @this {HarmonyDriver}
 * @returns {Promise<string[]>}
 */
export async function getLogTypes() {
  // XXX why doesn't `super` work here?
  const nativeLogTypes = await BaseDriver.prototype.getLogTypes.call(this);
  if (this.isWebContext()) {
    const webLogTypes = /** @type {string[]} */ (
      await /** @type {import('appium-chromedriver').Chromedriver} */ (
        this.chromedriver
      ).jwproxy.command('/log/types', 'GET')
    );
    return [...nativeLogTypes, ...webLogTypes];
  }
  return nativeLogTypes;
}

/**
 * @this {HarmonyDriver}
 * @param {string} logType
 * @returns {Promise<any>}
 */
export async function getLog(logType) {
  if (this.isWebContext() && !_.keys(this.supportedLogTypes).includes(logType)) {
    return await /** @type {import('appium-chromedriver').Chromedriver} */ (
      this.chromedriver
    ).jwproxy.command('/log', 'POST', { type: logType });
  }
  // XXX why doesn't `super` work here?
  return await BaseDriver.prototype.getLog.call(this, logType);
}

/**
 * @typedef {Object} BiDiListenerProperties
 * @property {string} type
 * @property {string} [srcEventName='output']
 * @property {string} [context=NATIVE_WIN]
 * @property {(x: Object) => import('./types').LogEntry} [entryTransformer]
 */

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */

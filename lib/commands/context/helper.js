import _ from 'lodash';
import { sleep } from 'asyncbox';
import { LRUCache } from 'lru-cache';

const WEBVIEW_WIN = 'WEBVIEW';
const WEBVIEW_BASE = `WEBVIEW_`;
const WEBVIEW_WAIT_INTERVAL_MS = 500;


/** @type {LRUCache<string, import('../types').WebviewsMapping>} */
const WEBVIEWS_CACHE = new LRUCache({
  max: 100,
  updateAgeOnGet: true,
});

/**
 * @this {import('../../driver').HarmonyDriver}
 * @param {string} webviewName
 * @returns {string}
 */
function getWebviewCacheKey(webviewName) {
  return `${this.driver.device.deviceSn}:${webviewName}`;
}

/**
 * @this {import('../../driver').HarmonyDriver}
 * @param {string} webviewName
 * @returns {import('../types').WebviewsMapping | undefined}
 */
function getWebviewMappingFromCache(webviewName) {
  const key = getWebviewCacheKey.bind(this)(webviewName);
  return WEBVIEWS_CACHE.get(key);
}

/**
 * @param {string} name
 * @returns {boolean}
 */
function isWebViewName(name) {
  return _.includes(name, WEBVIEW_WIN);
}

/**
 * @this {import('../../driver').HarmonyDriver}
 * @returns {Promise<import('../types').WebviewsMapping[]>}
 */
async function getWebViewsMapping({
  waitForWebviewMs = 0,
} = {}) {
  this.log.debug(`Getting a list of available webviews`);

  if (!_.isNumber(waitForWebviewMs)) {
    waitForWebviewMs = parseInt(`${waitForWebviewMs}`, 10) || 0;
  }
  const beginTime = new Date().getTime();

  /** @type {import('../types').WebviewsMapping[]} */
  let webviewsMapping = [];
  do {
    webviewsMapping = await getPotentialWebviews.bind(this)();
    if (webviewsMapping.length > 0) {
      break;
    }
    this.log.debug(`No webviews found, retry`);
    await sleep(WEBVIEW_WAIT_INTERVAL_MS);
  } while (new Date().getTime() - beginTime < waitForWebviewMs);

  for (const webviewMapping of webviewsMapping) {
    const key = getWebviewCacheKey.bind(this)(webviewMapping.webviewName);
    WEBVIEWS_CACHE.set(key, webviewMapping);
  }
  return webviewsMapping;
}

/**
 * @this {import('../../driver').HarmonyDriver}
 * @returns {Promise<import('../types').WebviewsMapping[]>}
 */
async function getPotentialWebviews() {
  /** @type {import('../types').WebviewsMapping[]} */
  const webviewsMapping = [];
  /** @type {string[]} */
  const socketNames = [];

  const out = await this.driver.shell('cat /proc/net/unix | grep webview_devtools_remote');
  this.log.debug(out);
  for (const line of out.split('\n')) {
    const match = /@[\w.]+_devtools_remote_(\d+)/.exec(line);
    if (!match) {
      continue;
    }
    const socketName = match[0];
    if (socketNames.includes(socketName)) {
      continue;
    }
    socketNames.push(socketName);
    const processId = match[1];
    const packageName = await this.driver.AppManager.getPackageByPID(processId);
    webviewsMapping.push({
      socketName,
      packageName,
      processId,
      webviewName: `${WEBVIEW_BASE}${packageName}`,
    });
  }

  const names = parseWebviewNames(webviewsMapping);
  if (names.length === 0) {
    this.log.debug('Found no active devtools sockets');
  } else {
    this.log.debug(`Parsed ${names.length} active devtools ${JSON.stringify(names)}`);
  }
  return webviewsMapping;
}

/**
 * @param {import('../types').WebviewsMapping[]} webviewsMapping
 * @returns {string[]}
 */
function parseWebviewNames(webviewsMapping) {
  /** @type {string[]} */
  const names = [];
  for (const { webviewName } of webviewsMapping) {
    if (webviewName) {
      names.push(webviewName);
    }
  }
  return names;
}

export {
  isWebViewName,
  getWebviewMappingFromCache,
  getWebViewsMapping,
  parseWebviewNames
};
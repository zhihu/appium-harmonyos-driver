import _ from 'lodash';
import path from 'path';
import { sleep } from 'asyncbox';
import { fs, util } from '@appium/support';
import Chromedriver from 'appium-chromedriver';
import { errors } from 'appium/driver';
import { getFreePort, HYPIUM_RES_PATH } from 'hypium-driver';
import {
  NATIVE_WIN,
  getWebviewMappingFromCache,
  getWebViewsMapping,
  isWebViewName,
  parseWebviewNames
} from './helpers';

/**
 * @this {import('../../driver').HarmonyDriver}
 * @returns {string}
 */
function defaultContextName() {
  return NATIVE_WIN;
}

/**
 * @this {import('../../driver').HarmonyDriver}
 * @returns {boolean}
 */
function isWebContext() {
  return this.curContext !== null && this.curContext !== NATIVE_WIN;
}

/**
 * @this {import('../../driver').HarmonyDriver}
 * @returns {Promise<string>}
 */
async function getCurrentContext() {
  return this.curContext || this.defaultContextName();
}

/**
* @this {import('../../driver').HarmonyDriver}
* @returns {Promise<string[]>}
*/
async function getContexts() {
  const webviewsMapping = await getWebViewsMapping.bind(this)(this.opts);
  /** @type {string[]} */
  const webviews = parseWebviewNames.bind(this)(webviewsMapping);
  const contexts = [NATIVE_WIN, ...webviews];
  this.log.debug(`Available contexts: ${JSON.stringify(contexts)}`);
  this.contexts = contexts;
  return this.contexts;
}

/**
 * @this {import('../../driver').HarmonyDriver}
 * @param {string?} name
 * @returns {Promise<void>}
 */
async function setContext(name) {
  if (!util.hasValue(name)) {
    name = this.defaultContextName();
  }
  // if we're already in the context we want, do nothing
  if (name === this.curContext) {
    return;
  }
  await this.getContexts();
  if (!_.includes(this.contexts, name)) {
    throw new errors.NoSuchContextError();
  }
  await this.switchContext(name);
  this.curContext = name;
}

/**
 * @this {import('../../driver').HarmonyDriver}
 * @param {string} name
 * @returns {Promise<void>}
 */
async function switchContext(name) {
  // We have some options when it comes to webviews. If we want a
  // Chromedriver webview, we can only control one at a time.
  if (isWebViewName(name)) {
    // start proxying commands directly to chromedriver
    await this.startChromedriverProxy(name);
  } else if (isWebViewName(this.curContext)) {
    // if we're moving to a non-chromedriver webview, and our current context
    // _is_ a chromedriver webview, if caps recreateChromeDriverSessions is set
    // to true then kill chromedriver session using stopChromedriverProxies or
    // else simply suspend proxying to the latter
    if (this.opts.recreateChromeDriverSessions) {
      this.log.debug('recreateChromeDriverSessions set to true; killing existing chromedrivers');
      await this.stopChromedriverProxies();
    } else {
      this.suspendChromedriverProxy();
    }
  } else {
    throw new Error(`Didn't know how to handle switching to context '${name}'`);
  }
}

/**
 * Turn on proxying to an existing Chromedriver session or a new one
 *
 * @this {import('../../driver').HarmonyDriver}
 * @param {string} context
 * @returns {Promise<void>}
 */
async function startChromedriverProxy(context) {
  this.log.debug(`Connecting to chrome-backed webview context '${context}'`);
  const webviewMapping = getWebviewMappingFromCache.bind(this)(context);
  let cd;
  if (this.sessionChromedrivers[context]) {
    this.log.debug(`Found existing Chromedriver for context '${context}'. Using it.`);
    cd = this.sessionChromedrivers[context];
    await setupExistingChromedriver.bind(this)(cd, webviewMapping);
  } else {
    this.log.debug(`Setup new Chromedriver for context '${context}'.`);
    const opts = /** @type {any} */ (_.cloneDeep(this.opts));
    cd = await setupNewChromedriver.bind(this)(opts, webviewMapping);
    // bind our stop/exit handler, passing in context so we know which
    // one stopped unexpectedly
    cd.on(Chromedriver.EVENT_CHANGED, (msg) => {
      if (msg.state === Chromedriver.STATE_STOPPED) {
        this.onChromedriverStop(context);
      }
    });
    // save the chromedriver object under the context
    this.sessionChromedrivers[context] = cd;
  }
  // hook up the local variables so we can proxy this biz
  this.chromedriver = cd;
  // @ts-ignore chromedriver is defined
  this.proxyReqRes = this.chromedriver.proxyReq.bind(this.chromedriver);
  this.proxyCommand = /** @type {import('@appium/types').ExternalDriver['proxyCommand']} */ (
    // @ts-ignore chromedriver is defined
    this.chromedriver.jwproxy.command.bind(this.chromedriver.jwproxy)
  );
  this.jwpProxyActive = true;
}

/**
 * Handle an out-of-band Chromedriver stop event
 *
 * @this {import('../../driver').HarmonyDriver}
 * @param {string} context
 * @returns {Promise<void>}
 */
async function onChromedriverStop(context) {
  this.log.warn(`Chromedriver for context ${context} stopped unexpectedly`);
  if (context === this.curContext) {
    // we exited unexpectedly while automating the current context and so want
    // to shut down the session and respond with an error
    let err = new Error('Chromedriver quit unexpectedly during session');
    await this.startUnexpectedShutdown(err);
  } else {
    // if a Chromedriver in the non-active context barfs, we don't really
    // care, we'll just make a new one next time we need the context.
    this.log.warn(
      "Chromedriver quit unexpectedly, but it wasn't the active " + 'context, ignoring',
    );
    delete this.sessionChromedrivers[context];
  }
}

/**
 * @this {import('../../driver').HarmonyDriver}
 * @returns {Promise<void>}
 */
async function stopChromedriverProxies() {
  this.suspendChromedriverProxy(); // make sure we turn off the proxy flag
  for (let context of _.keys(this.sessionChromedrivers)) {
    let cd = this.sessionChromedrivers[context];
    this.log.debug(`Stopping chromedriver for context ${context}`);
    // stop listening for the stopped state event
    cd.removeAllListeners(Chromedriver.EVENT_CHANGED);
    try {
      await cd.stop();
    } catch (err) {
      this.log.warn(`Error stopping Chromedriver: ${/** @type {Error} */ (err).message}`);
    }
    delete this.sessionChromedrivers[context];
  }
}

/**
 * Stop proxying to any Chromedriver
 *
 * @this {import('../../driver').HarmonyDriver}
 * @returns {void}
 */
function suspendChromedriverProxy() {
  this.chromedriver = undefined;
  this.proxyReqRes = undefined;
  this.proxyCommand = undefined;
  this.jwpProxyActive = false;
}

/**
 * @this {import('../../driver').HarmonyDriver}
 * @param {import('../types').WebviewsMapping} webviewMapping
 * @returns {Promise<Chromedriver>}
 */
async function setupNewChromedriver(opts = {}, webviewMapping) {
  // create hdc fport
  const localPort = await getFreePort();
  const remotePort = webviewMapping.socketName.replace('@', 'localabstract:');
  await this.driver.device.createForward(`tcp:${localPort}`, `${remotePort}`);

  if (opts.chromedriverPort) {
    this.log.debug(`Using user-specified port ${opts.chromedriverPort} for chromedriver`);
  } else {
    // if a single port wasn't given, we'll look for a free one
    opts.chromedriverPort = await getFreePort();
  }
  if (opts.chromedriverExecutableDir && await fs.exists(opts.chromedriverExecutableDir)) {
    this.log.debug(`Using user-specified executable dir ${opts.chromedriverPort} for chromedriver`);
  } else {
    opts.chromedriverExecutableDir = path.join(HYPIUM_RES_PATH, 'chromedriver');
  }

  const chromedriver = new Chromedriver({
    port: String(opts.chromedriverPort),
    executable: opts.chromedriverExecutable,
    // eslint-disable-next-line object-shorthand
    adb: undefined,
    cmdArgs: /** @type {string[]} */ (opts.chromedriverArgs),
    verbose: !!opts.showChromedriverLog,
    executableDir: opts.chromedriverExecutableDir,
    mappingPath: opts.chromedriverChromeMappingFile,
    // @ts-ignore this property exists
    bundleId: opts.chromeBundleId,
    useSystemExecutable: opts.chromedriverUseSystemExecutable,
    disableBuildCheck: opts.chromedriverDisableBuildCheck,
    // @ts-ignore this is ok
    details: undefined,
    // isAutodownloadEnabled: isChromedriverAutodownloadEnabled.bind(this)(),
  });

  /** @type {object} */
  const chromeOptions = opts.chromeOptions || {};
  for (const opt of _.keys(opts)) {
    if (opt.endsWith('chromeOptions')) {
      this.log.warn(`Merging '${opt}' into 'chromeOptions'. This may cause unexpected behavior`);
      _.merge(opts.chromeOptions, opts[opt]);
    }
  }
  chromeOptions.debuggerAddress = `127.0.0.1:${localPort}`;
  // we can only use the xpath locator when w3c was not set or it was true
  chromeOptions.w3c = chromeOptions.w3c || false;
  const caps = {
    chromeOptions,
  };
  await chromedriver.start(caps);
  return chromedriver;
}

/**
 * @this {import('../../driver').HarmonyDriver}
 * @template {Chromedriver} T
 * @param {T} chromedriver
 * @param {import('../types').WebviewsMapping} webviewMapping
 * @returns {Promise<T>}
 */
async function setupExistingChromedriver(chromedriver, webviewMapping) {
  // we need to recreate fport when the app has been restarted
  const caps = chromedriver.capabilities;
  this.log.debug(`${JSON.stringify(caps)}`);
  /** @type {string} */
  const debuggerAddress = caps.chromeOptions ? caps.chromeOptions.debuggerAddress : caps['goog:chromeOptions'].debuggerAddress;
  const localForward = `tcp:${debuggerAddress.split(':')[1]}`;
  const remoteForward = webviewMapping.socketName.replace('@', 'localabstract:');
  const out = await this.driver.device.exec(`fport ls`);
  this.log.debug(out);
  for (const line of out.split('\n')) {
    if (!line.includes(localForward)) {
      continue;
    }
    if (line.includes(remoteForward)) {
      this.log.debug('the webview socket does not changes');
      break;
    }
    const match = /localabstract:[\w.]+_devtools_remote_\d+/.exec(line);
    if (match) {
      // remove old hdc fport
      await this.driver.device.removeForward(localForward, `${match[0]}`);
      await sleep(2000);
      // create new hdc fport
      await this.driver.device.createForward(localForward, remoteForward);
    }
  }

  // check the status by sending a simple window-based command to ChromeDriver
  // if there is an error, we want to recreate the Chromedriver session
  if (!(await chromedriver.hasWorkingWebview())) {
    this.log.debug('ChromeDriver is not associated with a window. Re-initializing the session.');
    await chromedriver.restart();
  }
  return chromedriver;
}

export {
  defaultContextName,
  getContexts,
  getCurrentContext,
  isWebContext,
  onChromedriverStop,
  setContext,
  startChromedriverProxy,
  stopChromedriverProxies,
  suspendChromedriverProxy,
  switchContext,
};
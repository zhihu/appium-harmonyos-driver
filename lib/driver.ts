import type {
  AppiumServer,
  DriverCaps,
  DriverData,
  DriverOpts,
  ExternalDriver,
  InitialOpts,
  RouteMatcher,
  StringRecord,
  W3CDriverCaps,
} from '@appium/types';
import { Chromedriver } from 'appium-chromedriver';
import { BaseDriver } from 'appium/driver';
import { util } from 'appium/support';
import { UiComponent, UiDriver } from 'hypium-driver';
import _ from 'lodash';
import { LRUCache } from 'lru-cache';
import {
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
} from './commands/context/context';
import { execute, executeMobile } from './commands/execute';
import commands from './commands/index';
import {
  assignBiDiLogListener,
  GET_SERVER_LOGS_FEATURE,
  getLog,
  getLogTypes,
  nativeLogEntryToSeleniumEntry,
  startLogsBroadcast,
  stopLogsBroadcast,
  supportedLogTypes,
} from './commands/log';
import { LogListener } from './commands/types';
import HARMONY_DRIVER_CONSTRAINTS, { type HarmonyDriverConstraints } from './constraints';
import { executeMethodMap } from './method-map';

// NO_PROXY contains the paths that we never want to proxy to chromedriver.
// This part copy from UiAutomator2
const NO_PROXY: RouteMatcher[] = [
  ['DELETE', new RegExp('^/session/[^/]+/actions')],
  ['GET', new RegExp('^/session/(?!.*/)')],
  ['GET', new RegExp('^/session/[^/]+/alert_[^/]+')],
  ['GET', new RegExp('^/session/[^/]+/alert/[^/]+')],
  ['GET', new RegExp('^/session/[^/]+/appium/[^/]+/current_activity')],
  ['GET', new RegExp('^/session/[^/]+/appium/[^/]+/current_package')],
  ['GET', new RegExp('^/session/[^/]+/appium/app/[^/]+')],
  ['GET', new RegExp('^/session/[^/]+/appium/device/[^/]+')],
  ['GET', new RegExp('^/session/[^/]+/appium/settings')],
  ['GET', new RegExp('^/session/[^/]+/context')],
  ['GET', new RegExp('^/session/[^/]+/contexts')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/attribute')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/displayed')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/enabled')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/location_in_view')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/name')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/screenshot')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/selected')],
  ['GET', new RegExp('^/session/[^/]+/ime/[^/]+')],
  ['GET', new RegExp('^/session/[^/]+/location')],
  ['GET', new RegExp('^/session/[^/]+/network_connection')],
  ['GET', new RegExp('^/session/[^/]+/screenshot')],
  ['GET', new RegExp('^/session/[^/]+/timeouts')],
  ['GET', new RegExp('^/session/[^/]+/url')],
  ['POST', new RegExp('^/session/[^/]+/[^/]+_alert$')],
  ['POST', new RegExp('^/session/[^/]+/actions')],
  ['POST', new RegExp('^/session/[^/]+/alert/[^/]+')],
  ['POST', new RegExp('^/session/[^/]+/app/[^/]')],
  ['POST', new RegExp('^/session/[^/]+/appium/[^/]+/start_activity')],
  ['POST', new RegExp('^/session/[^/]+/appium/app/[^/]+')],
  ['POST', new RegExp('^/session/[^/]+/appium/compare_images')],
  ['POST', new RegExp('^/session/[^/]+/appium/device/(?!set_clipboard)[^/]+')],
  ['POST', new RegExp('^/session/[^/]+/appium/element/[^/]+/replace_value')],
  ['POST', new RegExp('^/session/[^/]+/appium/element/[^/]+/value')],
  ['POST', new RegExp('^/session/[^/]+/appium/getPerformanceData')],
  ['POST', new RegExp('^/session/[^/]+/appium/performanceData/types')],
  ['POST', new RegExp('^/session/[^/]+/appium/settings')],
  ['POST', new RegExp('^/session/[^/]+/appium/execute_driver')],
  ['POST', new RegExp('^/session/[^/]+/appium/start_recording_screen')],
  ['POST', new RegExp('^/session/[^/]+/appium/stop_recording_screen')],
  ['POST', new RegExp('^/session/[^/]+/appium/.*event')],
  ['POST', new RegExp('^/session/[^/]+/context')],
  ['POST', new RegExp('^/session/[^/]+/element')],
  ['POST', new RegExp('^/session/[^/]+/ime/[^/]+')],
  ['POST', new RegExp('^/session/[^/]+/keys')],
  ['POST', new RegExp('^/session/[^/]+/location')],
  ['POST', new RegExp('^/session/[^/]+/network_connection')],
  ['POST', new RegExp('^/session/[^/]+/timeouts')],
  ['POST', new RegExp('^/session/[^/]+/url')],

  // MJSONWP commands
  ['GET', new RegExp('^/session/[^/]+/log/types')],
  ['POST', new RegExp('^/session/[^/]+/execute')],
  ['POST', new RegExp('^/session/[^/]+/execute_async')],
  ['POST', new RegExp('^/session/[^/]+/log')],
  // W3C commands
  // For Selenium v4 (W3C does not have this route)
  ['GET', new RegExp('^/session/[^/]+/se/log/types')],
  ['GET', new RegExp('^/session/[^/]+/window/rect')],
  ['POST', new RegExp('^/session/[^/]+/execute/async')],
  ['POST', new RegExp('^/session/[^/]+/execute/sync')],
  // For Selenium v4 (W3C does not have this route)
  ['POST', new RegExp('^/session/[^/]+/se/log')],
];

// This is a set of methods and paths that we never want to proxy to Chromedriver.
// This part copy from UiAutomator2
const CHROME_NO_PROXY: RouteMatcher[] = [
  ['GET', new RegExp('^/session/[^/]+/appium')],
  ['GET', new RegExp('^/session/[^/]+/context')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/rect')],
  ['GET', new RegExp('^/session/[^/]+/orientation')],
  ['POST', new RegExp('^/session/[^/]+/appium')],
  ['POST', new RegExp('^/session/[^/]+/context')],
  ['POST', new RegExp('^/session/[^/]+/orientation')],

  // this is needed to make the mobile: commands working in web context
  ['POST', new RegExp('^/session/[^/]+/execute$')],
  ['POST', new RegExp('^/session/[^/]+/execute/sync')],

  // MJSONWP commands
  ['GET', new RegExp('^/session/[^/]+/log/types$')],
  ['POST', new RegExp('^/session/[^/]+/log$')],
  // W3C commands
  // For Selenium v4 (W3C does not have this route)
  ['GET', new RegExp('^/session/[^/]+/se/log/types$')],
  // For Selenium v4 (W3C does not have this route)
  ['POST', new RegExp('^/session/[^/]+/se/log$')],
];

type HarmonyDriverCaps = DriverCaps<HarmonyDriverConstraints>;
type HarmonyDriverOpts = DriverOpts<HarmonyDriverConstraints>;
type W3CHarmonyDriverCaps = W3CDriverCaps<HarmonyDriverConstraints>;

class UiComponentCache extends LRUCache<string, UiComponent> {
  constructor() {
    super({ max: 128, updateAgeOnGet: true });
  }

  get(key: string): UiComponent {
    key = key.replace('_', '#');
    const comp = super.get(key);
    if (!comp) {
      throw new Error(`Can not resolve componet for ${key}`);
    }
    return comp;
  }
}

class HarmonyDriver
  extends BaseDriver<HarmonyDriverConstraints, StringRecord>
  implements ExternalDriver<HarmonyDriverConstraints, string, StringRecord> {

  static executeMethodMap = executeMethodMap;

  declare caps: HarmonyDriverCaps;
  declare opts: HarmonyDriverOpts;
  driver: UiDriver;

  componentCache: UiComponentCache;
  contexts?: string[];
  curContext: string;
  chromedriver?: Chromedriver;
  sessionChromedrivers: StringRecord<Chromedriver>;
  jwpProxyAvoid: RouteMatcher[];
  jwpProxyActive: boolean;
  proxyCommand?: ExternalDriver['proxyCommand'];
  proxyReqRes?: (...args: any) => any;

  _bidiServerLogListener?: (...args: any[]) => void;
  _hilogWebsocketListener?: LogListener;

  constructor(opts: InitialOpts = {} as InitialOpts, shouldValidateCaps = true) {
    super(opts, shouldValidateCaps);

    this.desiredCapConstraints = _.cloneDeep(HARMONY_DRIVER_CONSTRAINTS);
    this.locatorStrategies = [
      'id',
      'key',
      'text',
      'type',
      'xpath',
      'HypiumBy',
      // web locator strategies
      'class name',
      'css selector',
      'link text',
      'partial link text',
      'tag name',
    ];
    this.componentCache = new UiComponentCache();
    this.curContext = this.defaultContextName();
    this.jwpProxyAvoid = NO_PROXY;
    this.jwpProxyActive = false;
    this.sessionChromedrivers = {};
    for (const [cmd, fn] of _.toPairs(commands)) {
      HarmonyDriver.prototype[cmd] = fn;
    }
  }

  async createSession(
    w3cCaps1: W3CHarmonyDriverCaps,
    w3cCaps2?: W3CHarmonyDriverCaps,
    w3cCaps3?: W3CHarmonyDriverCaps,
    driverData?: DriverData[]): Promise<[string, any]> {
    this.log.debug('Creating harmony session');
    const [sessionId, caps] = await super.createSession(w3cCaps1, w3cCaps2, w3cCaps3, driverData);
    this.caps = caps;
    this.driver = await UiDriver.connect(caps);
    if (!caps?.skipHilogCapture) {
      await this.driver.hilog.startHilog();
    }

    // 当参数中配置package和activity后，自动拉起对应app
    if (caps?.appPackage && caps?.appActivity) {
      await this.driver.startApp(caps.appPackage, caps.appActivity);
    }

    if (this.isFeatureEnabled(GET_SERVER_LOGS_FEATURE)) {
      [, this._bidiServerLogListener] = this.assignBiDiLogListener(
        this.log.unwrap(), {
        type: 'server',
        srcEventName: 'log',
        entryTransformer: nativeLogEntryToSeleniumEntry,
      }
      );
    }
    return [sessionId, caps];
  }

  override async deleteSession(sessionId?: string | null) {
    this.log.debug('Deleting harmony session');
    if (this.server) {
      await this.removeAllSessionWebSocketHandlers(this.server, sessionId);
    }
    try {
      this.componentCache.clear();
      this.driver?.disconnect();
      await this.driver?.hilog.stopHilog();
    } catch (e) {
      this.log.warn(`Deleting harmony session error. Original error: ${e.message}`);
    }
    if (this._bidiServerLogListener) {
      this.log.unwrap().off('log', this._bidiServerLogListener);
    }
    await super.deleteSession();
  }

  async removeAllSessionWebSocketHandlers(server: AppiumServer, sessionId?: string | null) {
    if (!server || !_.isFunction(server.getWebSocketHandlers)) {
      return;
    }
    const activeHandlers = await server.getWebSocketHandlers(sessionId);
    for (const pathname of _.keys(activeHandlers)) {
      await server.removeWebSocketHandler(pathname);
    }
  }

  canProxy() {
    return true;
  }

  proxyActive(sessionId: string) {
    return this.jwpProxyActive;
  }

  getProxyAvoidList() {
    if (util.hasValue(this.chromedriver)) {
      // if the current context is webview(chromedriver), then return CHROME_NO_PROXY list
      this.jwpProxyAvoid = CHROME_NO_PROXY;
    } else {
      this.jwpProxyAvoid = NO_PROXY;
    }
    return this.jwpProxyAvoid;
  }

  execute = execute;
  executeMobile = executeMobile;

  assignBiDiLogListener = assignBiDiLogListener;
  getLogTypes = getLogTypes;
  getLog = getLog;
  startLogsBroadcast = startLogsBroadcast;
  stopLogsBroadcast = stopLogsBroadcast;
  supportedLogTypes = supportedLogTypes;

  defaultContextName = defaultContextName;
  getCurrentContext = getCurrentContext;
  getContexts = getContexts as any as (this: HarmonyDriver) => Promise<string[]>;
  setContext = setContext as any as (this: HarmonyDriver, name?: string) => Promise<void>;
  switchContext = switchContext;
  startChromedriverProxy = startChromedriverProxy;
  stopChromedriverProxies = stopChromedriverProxies;
  suspendChromedriverProxy = suspendChromedriverProxy;
  onChromedriverStop = onChromedriverStop;
  isWebContext = isWebContext;
}

export { HarmonyDriver };
export default HarmonyDriver;
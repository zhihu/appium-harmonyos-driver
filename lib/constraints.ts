import { type Constraints } from '@appium/types';

const HARMONY_DRIVER_CONSTRAINTS = {
  app: {
    presence: false,
    isString: true
  },
  getDeviceLogs: {
    isBoolean: true,
  },
  getDeviceLogsToPath: {
    isString: true,
  },
  skipHilogCapture: {
    isBoolean: true,
  },
  platformName: {
    isString: true,
    inclusionCaseInsensitive: ['Harmony', 'HarmonyOS'],
    presence: true,
  },
  deviceName: {
    isString: true,
  },
  appActivity: {
    isString: true,
  },
  appPackage: {
    isString: true,
  },
  chromedriverPort: {
    isNumber: true,
  },
  chromedriverPorts: {
    isArray: true,
  },
  chromedriverArgs: {
    isObject: true,
  },
  chromedriverExecutable: {
    isString: true,
  },
  chromedriverExecutableDir: {
    isString: true,
  },
  chromedriverChromeMappingFile: {
    isString: true,
  },
  chromedriverUseSystemExecutable: {
    isBoolean: true,
  },
  chromedriverDisableBuildCheck: {
    isBoolean: true,
  },
  chromeLoggingPrefs: {
    isObject: true,
  },
  autoWebviewTimeout: {
    isNumber: true,
  },
  waitForWebviewMs: {
    isNumber: true,
  },
  recreateChromeDriverSessions: {
    isBoolean: false,
  },
} as const satisfies Constraints;

export default HARMONY_DRIVER_CONSTRAINTS;
export type HarmonyDriverConstraints = typeof HARMONY_DRIVER_CONSTRAINTS;
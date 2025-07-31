import { longSleep } from 'asyncbox';

export const APP_STATE = /** @type {const}  */ ({
  NOT_INSTALLED: 0,
  NOT_RUNNING: 1,
  RUNNING_IN_BACKGROUND: 3,
  RUNNING_IN_FOREGROUND: 4,
});

const commands = {};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.mobileClearApp = async function (opts) {
  const { bundleId } = opts;
  return await this.driver.AppManager.clearAppData(bundleId);
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.mobileIsAppInstalled = async function (opts) {
  const { bundleId } = opts;
  return await this.driver.AppManager.isAppInstalled(bundleId);
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.mobileInstallApp = async function (opts) {
  const { appPath, timeout } = opts;
  return await this.driver.AppManager.installApp(appPath, timeout);
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.mobileRemoveApp = async function (opts) {
  const { bundleId } = opts;
  return await this.driver.AppManager.removeApp(bundleId);
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.mobileActivateApp = async function (opts) {
  const { bundleId, abilityId } = opts;
  return await this.driver.AppManager.startApp(bundleId, abilityId);
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.mobileTerminateApp = async function (opts) {
  const { bundleId, timeout } = opts;
  const appState = await this.mobileQueryAppState(opts);
  if (appState <= APP_STATE.NOT_RUNNING) {
    this.log.info(`The app '${bundleId}' is not running`);
    return false;
  }
  return await this.driver.AppManager.stopApp(bundleId, timeout);
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.mobileQueryAppState = async function (opts) {
  const { bundleId } = opts;
  return await this.driver.AppManager.queryAppState(bundleId);
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.mobileBackgroundApp = async function (opts) {
  const { seconds } = opts;
  const sleepMs = seconds * 1000;
  this.log.info('Press home buttom');
  await this.driver.pressHome();
  this.log.info(`Wait ${seconds} seconds`);
  await longSleep(sleepMs);

  const missions = await this.getMissionTasks();
  if (missions.length === 0) {
    this.log.warn('App mission list is empty');
    return;
  }
  const { bundleName, abilityName } = missions[0];
  await this.mobileActivateApp({ bundleId: bundleName, abilityId: abilityName });
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.getMissionTasks = async function () {
  return await this.driver.AppManager.getMissionInfos();
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.getCurrentActivity = async function () {
  return await this.driver.AppManager.getCurrentActivity();
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.getCurrentPackage = async function () {
  return await this.driver.AppManager.getCurrentPackage();
};

export { commands };
export default commands;

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */
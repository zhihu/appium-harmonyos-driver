import { fs, tempDir, util } from '@appium/support';

const DisplayRotation = {
  ROTATION_0: 0,
  ROTATION_90: 1,
  ROTATION_180: 2,
  ROTATION_270: 3,
};

const commands = {};

/**
 * @this {HarmonyDriver & typeof commands}
 * @returns {Promise<boolean>} `true | false`
 */
commands.mobileIsLocked = async function () {
  return await this.driver.Screen.isLocked();
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @returns {Promise<void>}
 */
commands.mobileLock = async function (opts) {
  this.log.debug(`${JSON.stringify(opts)}`);
  await this.driver.Screen.lock();
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @returns {Promise<void>}
 */
commands.mobileUnlock = async function () {
  await this.driver.Screen.unlock();
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @returns {Promise<void>}
 */
commands.mobileWakeUp = async function () {
  await this.driver.Screen.wakeUp();
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @returns {Promise<string>} `LANDSCAPE | PORTRAIT`
 */
commands.getOrientation = async function () {
  let roation = await this.driver.Screen.getDisplayRotation();
  if (roation === 0 || roation === 2) {
    return 'PORTRAIT';
  } else {
    return 'LANDSCAPE';
  }
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @param {string} orientation
 * @returns {Promise<void>}
 */
commands.setOrientation = async function (orientation) {
  let roation;
  if (orientation === 'LANDSCAPE') {
    roation = 3;
  } else if (orientation === 'PORTRAIT') {
    roation = 0;
  } else {
    roation = DisplayRotation[orientation] || 0;
  }
  await this.driver.Screen.setDisplayRotation(roation);
};

/**
 * @this {HarmonyDriver}
 * @returns {Promise<import('@appium/types').Size>}
 */
commands.getDisplayDensity = async function () {
  return await this.driver.Screen.getDisplayDensity();
};

/**
 * @this {HarmonyDriver}
 * @returns {Promise<import('@appium/types').Size>}
 */
commands.getDisplaySize = async function () {
  return await this.driver.Screen.getDisplaySize();
};

/**
 * @this {HarmonyDriver}
 */
commands.getScreenshot = async function () {
  const shotPath = await tempDir.path({ prefix: 'appium', suffix: '.png' });
  await this.driver.screenCap(shotPath);
  return (await util.toInMemoryBase64(shotPath)).toString();
};

/**
 * @this {HarmonyDriver}
 */
commands.startRecordingScreen = async function (options = {}) {
  this.log.debug(`startRecordingScreen ${JSON.stringify(options)}`);
  await this.driver.Screen.startRecordingScreen(options);
  return '';
};

/**
 * @this {HarmonyDriver}
 */
commands.stopRecordingScreen = async function (options = {}) {
  this.log.debug(`stopRecordingScreen ${JSON.stringify(options)}`);
  const mp4 = await tempDir.path({ prefix: 'appium', suffix: '.tmp' });
  try {
    await this.driver.Screen.stopRecordingScreen({ mp4 });
    return (await util.toInMemoryBase64(mp4)).toString();
  } finally {
    if (await fs.exists(mp4)) {
      await fs.unlink(mp4);
    }
  }
};

export { commands };
export default commands;

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */
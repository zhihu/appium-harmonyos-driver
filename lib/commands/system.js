import moment from 'moment';
import { fs, tempDir, zip } from 'appium/support';

const commands = {};

/**
  * @this {HarmonyDriver & typeof commands}
  * @param {Object} args
  */
commands.shell = async function (args) {
  const command = args.command;
  const timeout = args.timeout || 300 * 1000;
  return await this.driver.shell(command, timeout);
};

/**
  * @this {HarmonyDriver & typeof commands}
  * @param {object} opts
  * @returns {Promise<void|Buffer>}
  */
commands.getDeviceLogs = async function (opts) {
  const { logItems } = opts;
  const toPath = this.caps?.getDeviceLogsToPath;
  const localPath = toPath ? toPath : await tempDir.openDir();
  await this.driver.System.stopHilogTask(localPath, logItems);
  if (toPath) {
    return;
  }
  try {
    // 返回zip压缩包
    return await zip.toInMemoryZip(localPath);
  } finally {
    await fs.rimraf(localPath);
  }
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @param {object} opts
 * @returns {Promise<string>}
 */
commands.getDeviceTime = async function (opts = {}) {
  const format = opts.format || moment.defaultFormat;
  const deviceTimestamp = (await this.driver.shell('date +%Y-%m-%dT%T%z')).trim();
  this.log.debug(`Got device timestamp: ${deviceTimestamp}`);
  const parsedTimestamp = moment.utc(deviceTimestamp, 'YYYY-MM-DDTHH:mm:ssZZ');
  if (!parsedTimestamp.isValid()) {
    this.log.warn('Cannot parse the returned timestamp. Returning as is');
    return deviceTimestamp;
  }
  // @ts-expect-error private API
  return parsedTimestamp.utcOffset(parsedTimestamp._tzm || 0).format(format);
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @returns {Promise<string>}
 */
commands.getPowerCapacity = async function () {
  const stdout = await this.driver.shell('cat /sys/class/power_supply/Battery/capacity');
  if (stdout.includes('No such file or directory')) {
    throw new Error(stdout);
  }
  return stdout;
};

export { commands };
export default commands;

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */
import { fs, tempDir } from '@appium/support';
import { toXMLLayout } from 'hypium-driver';

const commands = {};

/**
 * @this {HarmonyDriver & typeof commands}
 * @returns {Promise<string>} `xml content`
 */
commands.getPageSource = async function () {
  const localPath = await tempDir.path({ prefix: 'appium', suffix: '.tmp' });
  try {
    await this.driver.dumpLayout(localPath);
    if (!await fs.exists(localPath)) {
      throw new Error(`pull layout file failed! the local path '${localPath}' does not exist`);
    }
    this.log.info('get layout file content');
    return toXMLLayout(localPath);
  } finally {
    if (await fs.exists(localPath)) {
      await fs.unlink(localPath);
    }
  }
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.getWindowRect = async function () {
  return this.getDisplaySize();
};

/**
 * @this {HarmonyDriver & typeof commands}
 */
commands.getWindowSize = async function () {
  return this.getDisplaySize();
};

export { commands };
export default commands;

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */
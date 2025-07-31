import { errors } from 'appium/driver';
import { fs, util, tempDir, zip } from '@appium/support';

const commands = {};

/**
 * @this {HarmonyDriver & typeof commands}
 * @param {object} opts
 * @returns {Promise<string>} base64 string
 */
commands.pullFile = async function (opts) {
  const { remotePath } = opts;
  if (!remotePath) {
    throw new errors.InvalidArgumentError('remotePath must be provided');
  }
  if (!await this.driver.Storage.isRemoteFileExist(remotePath)) {
    throw new Error(`pull file failed! the remote path '${remotePath}' does not exist`);
  }
  const localPath = await tempDir.path({ prefix: 'appium', suffix: '.tmp' });
  try {
    if (!await this.driver.Storage.pullFile(remotePath, localPath)) {
      throw new Error('pull file failed');
    }
    if (!await fs.exists(localPath)) {
      throw new Error(`pull file failed! the local path '${localPath}' does not exist`);
    }
    return (await util.toInMemoryBase64(localPath)).toString();
  } finally {
    if (await fs.exists(localPath)) {
      await fs.unlink(localPath);
    }
  }
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @param {object} opts
 * @returns {Promise<string>}
 */
commands.pullFolder = async function (opts) {
  const { remotePath } = opts;
  if (!remotePath) {
    throw new errors.InvalidArgumentError('remotePath must be provided');
  }
  if (!await this.driver.Storage.isRemoteFileExist(remotePath)) {
    throw new Error(`pull folder failed! the remote path '${remotePath}' does not exist`);
  }
  const localPath = await tempDir.openDir();
  try {
    if (!await this.driver.Storage.pullFile(remotePath, localPath)) {
      throw new Error('pull folder failed');
    }
    // 返回zip压缩包
    return (await zip.toInMemoryZip(localPath, {
      encodeToBase64: true,
    })).toString();
  } finally {
    await fs.rimraf(localPath);
  }
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @param {object} opts
 * @returns {Promise<void>}
 */
commands.pushFile = async function (opts) {
  const { remotePath, payload } = opts;
  if (!remotePath) {
    throw new errors.InvalidArgumentError('remotePath must be provided');
  }
  if (!payload) {
    this.log.info('push an empty file to remote');
  }
  const localPath = await tempDir.path({ prefix: 'appium', suffix: '.tmp' });
  const content = Buffer.from(payload, 'base64');
  await fs.writeFile(localPath, content.toString('binary'), 'binary');
  try {
    if (!await this.driver.Storage.pushFile(localPath, remotePath)) {
      throw new Error('push file failed');
    }
  } finally {
    if (await fs.exists(localPath)) {
      await fs.unlink(localPath);
    }
  }
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @param {object} opts
 */
commands.deleteFile = async function (opts) {
  const { remotePath } = opts;
  if (!remotePath) {
    throw new errors.InvalidArgumentError('remotePath must be provided');
  }
  if (!await this.driver.Storage.isRemoteFileExist(remotePath)) {
    throw new Error(`delete file failed! the remote path '${remotePath}' does not exist`);
  }
  const out = await this.driver.shell(`rm -r ${remotePath}`);
  this.log.debug(out);
};

export { commands };
export default commands;

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */
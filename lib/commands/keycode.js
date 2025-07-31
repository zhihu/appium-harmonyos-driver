import { Point } from 'hypium-driver';

const commands = {};

/**
 * @this {HarmonyDriver}
 * @returns {Promise<void>}
 */
commands.back = async function () {
  await this.driver.pressBack();
};

/**
 * @this {HarmonyDriver}
 * @param {object} opts
 * @returns {Promise<void>}
 */
commands.pressKey = async function (opts) {
  const { keycode, isLongPress = false, duration = 2000 } = opts;
  await this.driver.pressKey(keycode, isLongPress, duration);
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @param {object} opts
 * @returns {Promise<void>}
 */
commands.pressCombineKeys = async function (opts) {
  const { keycode } = opts;
  await this.driver.triggerCombineKeys(...keycode);
};

/**
 * @this {HarmonyDriver & typeof commands}
 * @param {object} opts
 * @returns {Promise<void>}
 */
commands.inputText = async function (opts) {
  const { text, x = 1, y = 1 } = opts;
  await this.driver.inputText(new Point(x, y), text);
};

export { commands };
export default commands;

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */
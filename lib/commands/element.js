import _ from 'lodash';

const commands = {};

/**
 * @this {HarmonyDriver}
 * @param {string} element
 * @returns {Promise<void>}
 */
commands.click = async function (element) {
  await this.componentCache.get(element).click();
};

/**
 * @this {HarmonyDriver}
 * @param {string} element
 * @returns {Promise<boolean>}
 */
commands.elementEnabled = async function (element) {
  return await this.componentCache.get(element).isEnabled();
};

/**
 * @this {HarmonyDriver}
 * @param {string} element
 * @returns {Promise<boolean>}
 */
commands.elementSelected = async function (element) {
  return await this.componentCache.get(element).isSelected();
};

/**
 * @this {HarmonyDriver}
 * @param {string} element
 * @returns {Promise<boolean>}
 */
commands.elementDisplayed = async function(element) {
  const { x, y } = await this.componentCache.get(element).getBoundsCenter();
  const { width, height } = await this.driver.Screen.getDisplaySize();

  return x >= 0 && x <= width && y >= 0 && y <= height;
};

/**
 * @this {HarmonyDriver}
 * @param {string} element
 * @returns {Promise<object>}
 */
commands.getElementRect = async function (element) {
  const rect = await this.componentCache.get(element).getBounds();
  return { x: rect.left, y: rect.top, width: rect.right - rect.left, height: rect.bottom - rect.top };
};

/**
 * @this {HarmonyDriver}
 * @param {string} element
 * @returns {Promise<import('@appium/types').Position>}
 */
commands.getLocationInView = async function (element) {
  const point = await this.componentCache.get(element).getBoundsCenter();
  return { x: point.x, y: point.y };
};

/**
 * @this {HarmonyDriver}
 * @param {string} element
 * @returns {Promise<string>}
 */
commands.getName = async function (element) {
  return this.componentCache.get(element).getType();
};

/**
 * @this {HarmonyDriver}
 * @param {string} element
 * @returns {Promise<import('@appium/types').Size>}
 */
commands.getSize = async function (element) {
  const rect = await this.componentCache.get(element).getBounds();
  return { width: rect.right - rect.left, height: rect.bottom - rect.top };
};

/**
 * @this {HarmonyDriver}
 * @param {string} element
 * @returns {Promise<string>}
 */
commands.getText = async function (element) {
  return await this.componentCache.get(element).getText();
};

/**
 * @this {HarmonyDriver}
 * @param {string} element
 * @returns {Promise<void>}
 */
commands.clear = async function (element) {
  await this.componentCache.get(element).clearText();
};

/**
 * @this {HarmonyDriver}
 * @param {string|string[]} keys
 * @param {string} element
 * @returns {Promise<void>}
 */
commands.setValue = async function (keys, element) {
  const text = _.isArray(keys) ? keys.join('') : keys;
  await this.componentCache.get(element).inputText(text);
};

/**
 * @this {HarmonyDriver}
 * @param {string} attrName
 * @param {string} element
 * @returns {Promise<string|boolean>}
 */
commands.getAttribute = async function (attrName, element) {
  const comp = this.componentCache.get(element);
  if (attrName === 'text') {
    return await comp.getText();
  } else if (attrName === 'type') {
    return await comp.getType();
  } else if (attrName === 'id' || attrName === 'key') {
    return await comp.getId();
  } else if (attrName === 'clickable') {
    return await comp.isClickable();
  } else if (attrName === 'scrollable') {
    return await comp.isScrollable();
  } else if (attrName === 'checked') {
    return await comp.isChecked();
  } else if (attrName === 'checkable') {
    return await comp.isCheckable();
  } else if (attrName === 'enabled') {
    return await comp.isEnabled();
  } else {
    throw new Error(`No such attribute ${attrName}`);
  }
};

export { commands };
export default commands;

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */
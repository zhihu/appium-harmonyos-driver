import { sleep } from 'asyncbox';

const commands = {};

/**
 * click gesture
 * @this {HarmonyDriver}
 * @param {object} opts
 */
commands.mobileClickGesture = async function (opts) {
  let { elementId, x, y } = opts;
  if (elementId) {
    await this.componentCache.get(elementId).click();
  } else {
    await this.driver.click(x, y);
  }
};

/**
 * double click gesture
 * @this {HarmonyDriver}
 * @param {object} opts
 */
commands.mobileDoubleClickGesture = async function (opts) {
  const { elementId, x, y } = opts || {};
  if (elementId) {
    await this.componentCache.get(elementId).doubleClick();
  } else {
    await this.driver.doubleClick(x, y);
  }
};

/**
 * long click gesture
 * @this {HarmonyDriver}
 * @param {object} opts
 */
commands.mobileLongClickGesture = async function (opts) {
  let { elementId, x, y, duration } = opts;
  if (elementId) {
    const point = await this.componentCache.get(elementId).getBoundsCenter();
    x = point.x;
    y = point.y;
  }
  if (!duration || duration === 0) {
    duration = 2000;
  }
  await this.driver.shell(`uinput -T -d ${x} ${y}`);
  await sleep(duration);
  await this.driver.shell(`uinput -T -u ${x} ${y}`);
};

/**
 * drags gesture
 * @this {HarmonyDriver}
 * @param {object} opts
 */
commands.mobileDragGesture = async function (opts) {
  let { elementId, startX, startY, endX, endY, speed } = opts;
  startX = Number(startX);
  startY = Number(startY);
  endX = Number(endX);
  endY = Number(endY);
  if (elementId) {
    const { x, y } = await this.componentCache.get(elementId).getBoundsCenter();
    startX = x;
    startY = y;
  }
  if (!speed || speed === 0) {
    speed = 2500;
  }
  await this.driver.drag(startX, startY, endX, endY, speed);
};

/**
 * scroll gesture
 * @this {HarmonyDriver}
 * @param {object} opts
 * @param {string} opts.elementId - 要滑动的元素的ID。如果缺少元素ID，则必须提供滑动边界区域。如果同时提供了元素ID和滑动边界区域，则该区域将被忽略
 * @param {number} opts.left - 滑动区域的左坐标
 * @param {number} opts.top - 滑动区域的顶部坐标
 * @param {number} opts.width - 滑动边界区域的宽度
 * @param {number} opts.height - 滑动边界区域的高度
 * @param {string} opts.direction - 滑动方向up、down、left、right（不区分大小写）。必填值
 * @param {number} opts.percent - 滑动距离占滑动区域大小的百分比。有效值必须是0..1范围内的浮点数，其中1.0表示100%。必填值
 * @param {number} opts.speed - 手势执行速度。该值不得为负数。默认值是5000
 */
commands.mobileScrollGesture = async function (opts) {
  let { elementId, left, top, width, height, direction, percent, speed } = opts;
  if (!direction) {
    throw new Error(`The parameter of direction must be provided!`);
  }
  if (!percent) {
    throw new Error(`The parameter of percent must be provided!`);
  }
  if (elementId) {
    const rect = await this.componentCache.get(elementId).getBounds();
    left = rect.left;
    top = rect.top;
    width = rect.right - left;
    height = rect.bottom - top;
  }
  await this.driver.Screen.scroll(left, top, width, height, direction, percent, speed);
};

/**
 * swipe gesture
 * @this {HarmonyDriver}
 * @param {object} opts
 * @param {string} opts.elementId - 要滑动的元素的ID。如果缺少元素ID，则必须提供滑动边界区域。如果同时提供了元素ID和滑动边界区域，则该区域将被忽略
 * @param {number} opts.left - 滑动区域的左坐标
 * @param {number} opts.top - 滑动区域的顶部坐标
 * @param {number} opts.width - 滑动边界区域的宽度
 * @param {number} opts.height - 滑动边界区域的高度
 * @param {string} opts.direction - 滑动方向up、down、left、right（不区分大小写）。必填值
 * @param {number} opts.percent - 滑动距离占滑动区域大小的百分比。有效值必须是0..1范围内的浮点数，其中1.0表示100%。必填值
 * @param {number} opts.speed - 手势执行速度。该值不得为负数。默认值是5000
 */
commands.mobileSwipeGesture = async function (opts) {
  let { elementId, left, top, width, height, direction, percent, speed } = opts;
  if (!direction) {
    throw new Error(`The parameter of direction must be provided!`);
  }
  if (!percent) {
    throw new Error(`The parameter of percent must be provided!`);
  }
  if (elementId) {
    const rect = await this.componentCache.get(elementId).getBounds();
    left = rect.left;
    top = rect.top;
    width = rect.right - left;
    height = rect.bottom - top;
  }
  await this.driver.Screen.swipe(left, top, width, height, direction, percent, speed);
};

/**
 * swipe to back（侧滑返回）
 * @this {HarmonyDriver}
 */
commands.swipeBack = async function () {
  await this.driver.Screen.swipeBack();
};

/**
 * swipe to home（上滑返回桌面）
 * @this {HarmonyDriver}
 */
commands.swipeHome = async function () {
  await this.driver.Screen.swipeHome();
};

/**
 * slide screen（滑动屏幕）
 * @this {HarmonyDriver}
 * @param {object} opts
 * @param {string} opts.direction - 滑动方向。up显示上方屏幕、down显示下方屏幕、left显示左侧屏幕、right显示右侧屏幕（不区分大小写）。必填值
 * @param {number} opts.percent - 滑动距离占滑动区域大小的百分比。有效值必须是0..1范围内的浮点数，其中1.0表示100%。默认值为0.5
 * @param {number} opts.times - 滑动次数。有效值必须是大于等于1的整数。默认值为1
 */
commands.slideScreen = async function (opts) {
  const { direction, percent, times } = opts;
  await this.driver.Screen.slideScreen(direction, percent, times);
};

/**
 * pinch close gesture
 * @this {HarmonyDriver}
 * @param {object} opts
 */
commands.mobilePinchCloseGesture = function (opts) {
  // todo
};

/**
 * pinch open gesture
 * @this {HarmonyDriver}
 * @param {object} opts
 */
commands.mobilePinchOpenGesture = function (opts) {
  // todo
};

export { commands };
export default commands;

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */
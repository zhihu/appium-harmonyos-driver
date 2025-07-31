
const actionMethods = {};

/**
* @this {HarmonyDriver}
* @returns {Promise<void>}
*/
actionMethods.performActions = async function (performActions) {
  const preprocessedAction = performActions[0];
  const { id, type, actions } = preprocessedAction;
  // 这里暂时当做swipe使用
  this.log.debug(`Preprocessed actions: ${JSON.stringify(preprocessedAction, null, '  ')}`);
  if (type === 'pointer' && id === 'touch') {
    const start = actions[0];
    const end = actions[2];
    await this.driver.swipe(start.x, start.y, end.x, end.y, end.duration);
  }
};

actionMethods.performMultiAction = async function (performAction) {

  this.log.debug(`performMultiAction action: ${JSON.stringify(performAction)}`);
};

export default actionMethods;

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */
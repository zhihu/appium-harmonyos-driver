
import _ from 'lodash';
import { errors, PROTOCOLS } from 'appium/driver';
import { executeMethodMap } from '../method-map';
import HarmonyDriver from '../driver';

const MOBILE_SCRIPT_NAME_PREFIX = 'mobile:';

/**
 * @this {import('../driver').HarmonyDriver}
 * @param {string} script
 * @param {any[]} [args]
 * @returns {Promise<any>}
 */
async function execute(script, args) {
  if (script.match(/^mobile:/)) {
    this.log.info(`Executing native command '${script}'`);
    script = toExecuteMethodName(script);
    return await this.executeMobile(
      script,
      _.isArray(args) ? /** @type {import('@appium/types').StringRecord} */ (args[0]) : args,
    );
  }
  if (!this.isWebContext()) {
    throw new errors.NotImplementedError();
  }
  const endpoint =
    /** @type {import('appium-chromedriver').Chromedriver} */ (this.chromedriver).jwproxy
      .downstreamProtocol === PROTOCOLS.MJSONWP
      ? '/execute'
      : '/execute/sync';
  this.log.info(`Executing in chromedriver, endpoint: ${endpoint}`);
  return await /** @type {import('appium-chromedriver').Chromedriver} */ (
    this.chromedriver
  ).jwproxy.command(endpoint, 'POST', {
    script,
    args,
  });
}

/**
 * @this {import('../driver').HarmonyDriver}
 * @param {string} cmd
 * @param {import('@appium/types').StringRecord} [opts={}]
 * @returns {Promise<any>}
 */
async function executeMobile(cmd, opts = {}) {
  if (!_.has(HarmonyDriver.executeMethodMap, cmd)) {
    throw new errors.UnknownCommandError(
      `Unknown mobile command "${cmd}". ` +
      `Only ${_.keys(executeMethodMap)} commands are supported.`,
    );
  }
  // @ts-ignore cmd is the key of import('../method-map').executeMethodMap
  const methodName = HarmonyDriver.executeMethodMap[cmd].command;
  return await this[methodName](opts);
}

/**
 * Type guard to check if a script is an execute method.
 * @param {string} script
 * @internal
 * @returns {string}
 */
function toExecuteMethodName(script) {
  return _.startsWith(script, MOBILE_SCRIPT_NAME_PREFIX)
    ? script.replace(new RegExp(`${MOBILE_SCRIPT_NAME_PREFIX}\\s*`), `${MOBILE_SCRIPT_NAME_PREFIX} `)
    : script;
}

export { execute, executeMobile };
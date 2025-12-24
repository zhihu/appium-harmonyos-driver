import { longSleep } from 'asyncbox';

export const APP_STATE = /** @type {const}  */ ({
  NOT_INSTALLED: 0,
  NOT_RUNNING: 1,
  RUNNING_IN_BACKGROUND: 3,
  RUNNING_IN_FOREGROUND: 4,
});

/**
 * @this {HarmonyDriver & typeof commands}
 * @param {string} bundleName
 */
async function getAbilityName(bundleName) {
  const out = await this.driver.shell(`bm dump -n ${bundleName}`);
  const abilities = getIconAbilities.bind(this)(out);
  if (abilities.length === 0) {
    return '';
  }
  for (const ability of abilities) {
    let score = 0;
    const { name, moduleName, moduleMainAbility, mainModule } = ability;
    // 判断ability和模块设置的moduleMainAbility是否等同
    if (name && name === moduleMainAbility) {
      score += 20;
    }
    // 判断entry是否为主entry
    if (moduleName && moduleName === mainModule) {
      score += 100;
    }
    Object.assign(ability, { score });
  }
  const sortedAbilities = abilities.sort((/** @type {{ score: number; }} */ a, /** @type {{ score: number; }} */ b) => b.score - a.score);
  this.log.info(`all icon abilities: ${JSON.stringify(sortedAbilities)}`);
  if (sortedAbilities.length > 1) {
    this.log.warn(`bundle has mutilple abilities, ${sortedAbilities.map((/** @type {{ name: any; }} */ item) => item.name)}`);
  }
  return sortedAbilities[0].name;
}

/**
 * @this {HarmonyDriver & typeof commands}
 * @param {string} bmdump
 */
function getIconAbilities(bmdump) {
  const abilities = [];
  let bundleInfo;
  try {
    bundleInfo = JSON.parse(bmdump.slice(bmdump.indexOf('{')));
  } catch (e) {
    this.log.error(`parse bm dump output error. ${e}`);
    return abilities;
  }
  const { mainEntry, hapModuleInfos } = bundleInfo;
  if (!hapModuleInfos) {
    return abilities;
  }
  for (const hapModuleInfo of hapModuleInfos) {
    try {
      // 读取hapModuleInfo
      const mainAbility = hapModuleInfo.mainAbility;
      const abilityInfos = hapModuleInfo.abilityInfos;
      // 读取abilityInfos
      for (const abilityInfo of abilityInfos) {
        const skills = abilityInfo.skills;
        if (Array.isArray(skills) && skills.length > 0 && skills[0].actions.includes('action.system.home')) {
          abilities.push({
            "name": abilityInfo.name,
            "moduleName": abilityInfo.moduleName,
            "moduleMainAbility": mainAbility,
            "mainModule": mainEntry,
          });
        }
      }
    } catch (e) {
      this.log.error(`parse ability info error. ${e}`);
    }
  }
  return abilities;
}

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
  let { bundleId, abilityId } = opts;
  abilityId = abilityId || await getAbilityName.bind(this)(bundleId);
  if (!abilityId) {
    throw new Error(`Automatic matching of ability name failed! Please use the interface 'mobile: activateApp' and provide the abilityId parameter, the try again`);
  }
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
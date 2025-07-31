import _ from 'lodash';
import { errors } from 'appium/driver';
import { BY, byExpression, UiComponent } from 'hypium-driver';

const commands = {};

/**
 * @this {HarmonyDriver}
 * @param {string} strategy
 * @param {string} selector
 * @param {boolean} mult
 * @param {string?} context
 * @returns {Promise<any>}
 */
commands.findElOrEls = async function (strategy, selector, mult, context) {
  let by;
  switch (strategy) {
    case 'id':
      by = BY.id(selector);
      break;
    case 'key':
      by = BY.key(selector);
      break;
    case 'text':
      by = BY.text(selector);
      break;
    case 'type':
      by = BY.type(selector);
      break;
    case 'xpath':
      by = BY.xpath(selector);
      break;
    case 'HypiumBy':
      by = byExpression(selector);
      break;
    default:
      break;
  }
  if (!by) {
    throw new Error('Must provide a selector when finding elements');
  }

  /**
   * @param {UiComponent} comp
   * @returns {Promise<string>}
   */
  const getComponentRef = async (comp) => {
    const ref = await comp.getRemoteRef();
    if (!ref) {
      this.log.error(`Get component reference error!`);
    }
    this.componentCache.set(ref, comp);
    // replace the component reference charactor '#' with charactor '_' when using in RESTful url
    // Example: Component#4 --> Component_4
    return ref.replace('#', '_');
  };

  if (mult) {
    const elements = [];
    try {
      const components = await this.driver.findComponents(by);
      for (const comp of components) {
        const componentRef = await getComponentRef(comp);
        elements.push({ 'ELEMENT': componentRef });
      }
    } catch (err) {
      this.log.error(err);
      throw new errors.NoSuchElementError(err);
    }
    if (_.isEmpty(elements)) {
      throw new errors.NoSuchElementError();
    }
    return elements;
  } else {
    try {
      let component;
      let element;
      if (strategy === 'xpath') {
        component = await this.driver.findComponentByXpath(by);
        if (!component) {
          throw new Error('find component by xpath failed!');
        }
        element = _.uniqueId();
        this.componentCache.set(element, component);
      } else {
        component = this.driver.findComponent(by);
        element = await getComponentRef(component);
      }
      return { 'ELEMENT': element };
    } catch (err) {
      this.log.error(err);
      throw new errors.NoSuchElementError(err);
    }
  }
};

export { commands };
export default commands;

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */
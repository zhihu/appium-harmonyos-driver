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
  const isXpathStrategy = strategy === 'xpath';
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

  let elementId;
  try {
    if (mult) {
      const elements = [];
      const components = await this.driver.findComponents(isXpathStrategy ? selector : by);
      for (const comp of components) {
        if (isXpathStrategy) {
          elementId = _.uniqueId();
          this.componentCache.set(elementId, comp);
        } else {
          elementId = await getComponentRef(comp);
        }
        elements.push({ 'ELEMENT': elementId });
      }
      if (_.isEmpty(elements)) {
        throw new errors.NoSuchElementError();
      }
      return elements;
    } else {
      let component;
      if (isXpathStrategy) {
        component = await this.driver.findComponentByXpath(selector);
        if (!component) {
          throw new Error('find component failed!');
        }
        elementId = _.uniqueId();
        this.componentCache.set(elementId, component);
      } else {
        component = this.driver.findComponent(by);
        elementId = await getComponentRef(component);
      }
      return { 'ELEMENT': elementId };
    }
  } catch (err) {
    this.log.error(err);
    throw new errors.NoSuchElementError(err);
  }
};

export { commands };
export default commands;

/**
 * @typedef {import('../driver').HarmonyDriver } HarmonyDriver
 */
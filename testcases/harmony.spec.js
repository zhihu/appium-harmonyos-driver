import { sleep } from 'asyncbox';
import { remote } from 'webdriverio';
let driver;
let $;
describe('demo application', function () {
  before(async function () {
    driver = await remote({
      hostname: '127.0.0.1',
      // path: '/wd/hub',
      port: 4723,
      capabilities: {
        platformName: 'harmonyos',
        'appium:automationName': 'harmonyos',
        'appium:newCommandTimeout': 3 * 60 * 1000,
      },
    });
    driver.addCommand('har$', async (using, value) => {
      const elem = await driver.findElement(using, value);
      return driver.$(elem);
    });
    // await driver.executeScript('mobile: activateApp', [{
    //   'bundleId':
    //     'com.huawei.hmos.settings', 'abilityId':
    //     'com.huawei.hmos.settings.MainAbility'
    // }]);
  });

  it('设置页面点击WLAN', async function () {
    await driver.har$('text', 'WLAN').click();
    await sleep(10000);
  });

  it('设置页面输⼊搜索内容', async function () {
    // 设置搜索框无法实现输入，是系统的问题，在短信内容输入框测试无问题
    await driver.har$('key', 'homPageSearchInput').setValue('123');
  });

  after(async function () {
    // await driver.pause(10000);
    // await driver.executeScript('mobile: terminateApp', [{
    //   'bundleId':
    //     'com.huawei.hmos.settings'
    // }]);
  });
});
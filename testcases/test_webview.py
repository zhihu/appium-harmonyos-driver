import time

from appium import webdriver
from appium.options.common.base import AppiumOptions
from selenium.webdriver.common.by import By


capabilities = {
    'platformName': 'harmonyos',
    'appium:automationName': 'harmonyos',
    'appium:deviceName': 'mate40',
    # 'appium:udid': '8VT5T21601007829',
    'appium:waitForWebviewMs': 5 * 1000,
    # 'chromedriverExecutableDir': "D:\\workspace3\\test\\webdriver\\chromedriver",
}

appium_server_url = 'http://localhost:4723'
options = AppiumOptions()
options.load_capabilities(capabilities)
driver = webdriver.Remote(appium_server_url, options=options)


def __test_context():
    # 注意，运行测试方法前，需要关闭所有应用
    driver.terminate_app('com.huawei.hmos.browser')
    time.sleep(3)

    print('current context:', driver.current_context)
    contexts = driver.contexts
    print('available contexts:', contexts)
    assert 1 == len(contexts)

    driver.execute_script('mobile: activateApp', {
                          'bundleId': 'com.huawei.hmos.browser', 'abilityId': 'MainAbility'})
    time.sleep(3)
    contexts = driver.contexts
    print('available contexts:', contexts)
    assert 2 == len(contexts)

    print('switch to WEBVIEW_com.huawei.hmos.browser')
    driver.switch_to.context('WEBVIEW_com.huawei.hmos.browser')
    print('current context:', driver.current_context)

    print('switch to native')
    driver.switch_to.context(None)
    print('current context:', driver.current_context)


def __test_webview():
    print('------------------test webview----------------------')
    print('switch context to WEBVIEW_com.huawei.hmos.browser')
    driver.switch_to.context('WEBVIEW_com.huawei.hmos.browser')
    print('current context:', driver.current_context)
    # 打开百度首页
    driver.get('https://www.baidu.com/')


def __test_native():
    print('------------------test native----------------------')
    print('switch context to native')
    driver.switch_to.context(None)
    # 返回桌面
    driver.press_keycode(1)

    driver.find_elements('HypiumBy', value='BY.isBefore(BY.text("设置")).type("Image")')[-1].click()


def test_switch_context():
    """测试context切换和UI操作是否异常"""
    # 注意，运行测试方法前，需要关闭所有应用
    __test_context()
    __test_webview()
    __test_native()
    # 再次切换
    # __test_context()
    # __test_webview()


def test_huawei_browser():
    """在华为浏览器测试webview"""
    # 关闭浏览器
    driver.terminate_app('com.huawei.hmos.browser')
    time.sleep(3)

    # 打开浏览器
    driver.execute_script('mobile: activateApp', {
                          'bundleId': 'com.huawei.hmos.browser', 'abilityId': 'MainAbility'})
    time.sleep(3)

    # 切换到webview模式
    driver.switch_to.context('WEBVIEW_com.huawei.hmos.browser')

    # 打开百度首页
    driver.get('https://www.baidu.com/')

    # 点击右上角图标进入“广场”
    # driver.find_element(By.XPATH, '//*[@id="userinfo-wrap"]/a').click()
    driver.find_element(By.CLASS_NAME, 'square-enterance').click()

    # 点击右上角图标进入“返回”
    driver.find_element(By.XPATH, '/html/body/div/div/div[1]/div/h3/a').click()

    # 输入搜索关键字“鸿蒙”
    driver.find_element(By.ID, 'index-kw').send_keys('鸿蒙')

    # 点击“百度一下”
    driver.find_element(By.ID, 'index-bn').click()


if __name__ == '__main__':
    test_switch_context()
    test_huawei_browser()

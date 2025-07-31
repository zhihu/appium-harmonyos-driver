import base64
import time

from appium import webdriver
from appium.options.common.base import AppiumOptions

capabilities = {
    'platformName': 'harmonyos',
    'appium:automationName': 'harmonyos',
    # 1.可选在指定SN的设备上运行
    # 'appium:udid': '8VT5T21601007829',

    # 2.可选是否抓取设备日志, True/False
    'appium:getDeviceLogs': True,

    # 3.可选将设备日志拉到指定目录（适用于用例运行环境和设备接入环境是在同一台电脑），若未指定路径，则会返回日志的zip压缩文件流
    # 'appium:getDeviceLogsToPath': 'D:\\test',
}
appium_server_url = 'http://localhost:4723'
options = AppiumOptions()
options.load_capabilities(capabilities)
driver = webdriver.Remote(appium_server_url, options=options)


def test_func():
    # 获取设备时间
    print(driver.get_device_time())

    # 获取屏幕旋转状态
    print(driver.orientation)

    # 获取设备电量
    print(driver.execute_script('mobile: getPowerCapacity'))

    # 执行hdc shell命令
    print(driver.execute_script('mobile: shell', {
          'command': 'whoami', 'timeout': 5 * 1000}))

    # 进入设置
    driver.find_elements(
        'HypiumBy', value='BY.isBefore(BY.text("设置")).type("Image")')[-1].click()
    time.sleep(0.2)

    # 按文本查找“搜索设置项”
    comp = driver.find_element('text', '搜索设置项')
    time.sleep(0.2)

    # 获取控件的属性
    for key in ['text', 'id', 'key', 'type', 'clickable', 'scrollable', 'checked', 'checkable', 'enabled']:
        print(f'{key}={comp.get_attribute(key)}')

    # 点击“搜索设置项”
    comp.click()

    # 输入搜索关键字“WLAN”
    driver.find_element('type', 'SearchField').send_keys('WLAN')
    time.sleep(0.2)

    # 点击搜索结果“WLAN”
    driver.find_elements('text', 'WLAN')[-1].click()
    time.sleep(0.2)

    # 侧滑返回
    driver.swipe(0, 600, 200, 600, 1)

    # 点击“返回按钮”
    driver.find_elements('key', 'searchBackButton')[-1].click()
    time.sleep(0.2)

    driver.find_element('xpath', '//*[@text="蓝牙"]').click()

    # 返回桌面
    driver.press_keycode(1)

    # 获取设备日志，将日志拉到appium:getDeviceLogsToPath设置的路径
    driver.execute_script('mobile: getDeviceLogs', {})


def test_recording_screen():
    driver.start_recording_screen()
    comp = driver.find_element('xpath', '//*[@id="__SearchField__homPageSearchInput"]')
    time.sleep(0.2)

    # 获取控件的属性
    for key in ['text', 'id', 'key', 'type', 'clickable', 'scrollable', 'checked', 'checkable', 'enabled']:
        print(f'{key}={comp.get_attribute(key)}')
    print(comp.rect)
    print(comp.size)
    print(comp.location)
    comp.send_keys('WLAN123!.')
    driver.find_element('xpath', '//*[@id="__SearchField__searchComponent"]').clear()

    ret = driver.stop_recording_screen()
    with open('D:\\test.mp4', 'wb') as mp4_file:
        mp4_file.write(base64.b64decode(ret))


if __name__ == '__main__':
    test_func()
    # test_recording_screen()

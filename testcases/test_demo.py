import base64
import socket
import threading
import time

from appium import webdriver
from appium.options.common.base import AppiumOptions
import websocket

capabilities = {
    'platformName': 'harmonyos',
    'appium:automationName': 'harmonyos',
    # 1.可选在指定SN的设备上运行
    # 'appium:udid': '8VT5T21601007829',
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


def test_recording_screen():
    driver.start_recording_screen()

    # 进入设置
    driver.find_elements(
        'HypiumBy', value='BY.isBefore(BY.text("设置")).type("Image")')[-1].click()
    time.sleep(0.2)

    comp = driver.find_element(
        'xpath', '//*[@id="__SearchField__homPageSearchInput"]')
    time.sleep(0.2)

    # 获取控件的属性
    for key in ['text', 'id', 'key', 'type', 'clickable', 'scrollable', 'checked', 'checkable', 'enabled']:
        print(f'{key}={comp.get_attribute(key)}')
    print(comp.rect)
    print(comp.size)
    print(comp.location)
    comp.send_keys('WLAN123!.')
    time.sleep(2)
    driver.find_element(
        'xpath', '//*[@id="__SearchField__searchComponent"]').clear()

    ret = driver.stop_recording_screen()
    with open('D:\\test.mp4', 'wb') as mp4_file:
        mp4_file.write(base64.b64decode(ret))


def get_hostip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1.0)
        s.connect(('huawei.com', 80))
        return s.getsockname()[0]
    finally:
        if s is not None:
            s.close()


def on_message(ws, message):
    print(message)


def on_error(ws, error):
    print(error)


def on_close(ws, close_status_code, close_msg):
    print("### closed ###")


def on_open(ws):
    print("Opened connection")


def print_logcat(session_id):
    print(f'session_id: {session_id}')
    hostip = get_hostip()
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(
        f"ws://{hostip}:4723/ws/session/{session_id}/appium/device/hilog",
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close)

    # Set dispatcher to automatic reconnection, 5 second reconnect delay if connection closed unexpectedly
    ws.run_forever(reconnect=5)


def test_logcat():
    driver.execute_script('mobile: startLogsBroadcast')
    t = threading.Thread(target=print_logcat, args=(driver.session_id,))
    t.daemon = True
    t.start()
    time.sleep(10)
    driver.execute_script('mobile: stopLogsBroadcast')

    print(driver.log_types)
    # 需将appium启动命令改为：appium --allow-insecure=get_server_logs
    print(driver.get_log('server'))
    print(driver.get_log('hilog'))


if __name__ == '__main__':
    test_func()
    # test_recording_screen()
    # test_logcat()

import base64
import os
import time
import unittest

from appium import webdriver
from appium.options.common.base import AppiumOptions

capabilities = {
    'platformName': 'harmonyos',
    'appium:automationName': 'harmonyos',
    # 1.可选在指定SN的设备上运行
    # 'appium:udid': '8VT5T21601007829',

    # 2.可选是否抓取设备日志, True/False
    # 'appium:catchDeviceLogs': True,

    # 3.可选将设备日志拉到指定目录（适用于用例运行环境和设备接入环境是在同一台电脑），若未指定路径，则会返回日志的zip压缩文件流
    # 'appium:getDeviceLogsToPath': 'D:\\test',
}

appium_server_url = 'http://localhost:4723'
options = AppiumOptions()
options.load_capabilities(capabilities)


class TestAppium(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Remote(appium_server_url, options=options)

    def tearDown(self):
        if self.driver:
            self.driver.quit()

    def test_element(self):
        comp = self.driver.find_element('text', '搜索设置项')
        # 获取控件属性
        print(comp.size)
        print(comp.rect)
        print(comp.location)
        print(comp.location_in_view)
        print(comp.is_enabled())
        print(comp.is_selected())

    def test_get_device_time(self):
        print(self.driver.execute_script(
            'mobile: getDeviceTime', {'format': 'YYYY-MM-DD HH:mm:ss'}))

    def test_push_and_pull(self):
        local_path = 'test.txt'
        with open(local_path, 'w') as txt:
            txt.write('123')
        self.driver.push_file('/data/local/tmp/test.txt',
                              source_path=local_path)
        os.remove(local_path)

        result = self.driver.pull_file('/data/local/tmp/test.txt')
        print(result)
        assert result == base64.b64encode('123'.encode()).decode()

    def test_pull_folder(self):
        import base64
        from io import BytesIO
        from zipfile import ZipFile

        ret = self.driver.pull_folder('/data/local/tmp')
        with ZipFile(BytesIO(base64.b64decode(ret))) as fzip:
            for filename in fzip.namelist():
                print(filename)

    def test_delete_file(self):
        print(self.driver.execute_script(
            "mobile: deleteFile", {'remotePath': '/data/local/tmp/a.txt'}))

    def test_app_install(self):
        print('---install app')
        print(self.driver.install_app('path-to-hap'))

        print('---is app installed')
        print(self.driver.is_app_installed('com.ohos.devicetest'))

        print('---remove app')
        print(self.driver.remove_app('com.ohos.devicetest'))

        print('---is app installed')
        print(self.driver.is_app_installed('com.ohos.devicetest'))

    def test_start_app(self):
        # self.driver.activate_app('com.huawei.hmos.photos')
        self.driver.execute_script(
            'mobile: activateApp', {'bundleId': 'com.huawei.hmos.photos', 'abilityId': 'com.huawei.hmos.photos.MainAbility'})

    def test_background(self):
        self.driver.background_app(5)

    def test_clear_app(self):
        self.driver.execute_script(
            'mobile: clearApp', {'bundleId': 'com.huawei.hmos.photos'})

    def test_app_state(self):
        print(self.driver.query_app_state('com.huawei.hmos.photos'))

    def test_terminate_app(self):
        self.driver.terminate_app('com.huawei.hmos.photos')

    def test_remove_app(self):
        self.driver.remove_app('com.deveco.myapplication')

    def test_current_xx(self):
        print(self.driver.current_activity)
        print(self.driver.current_package)
        print(self.driver.current_context)

    def test_get_app_settigns(self):
        print(self.driver.app_strings())

    def test_go_back(self):
        self.driver.back()

    def test_press_key(self):
        self.driver.press_keycode(1)

    def test_long_press_keycode(self):
        # 电源键，默认长按2秒
        self.driver.long_press_keycode(18)

        # 电源键，若需自定义长按时长，如5秒
        self.driver.execute_script(
            'mobile: pressKey', {'keycode': 18, 'isLongPress': True, 'duration': 5000})

    def test_press_combine_keys(self):
        # 组合键，电源键18 + 音量下键17
        self.driver.execute_script(
            'mobile: pressCombineKeys', {'keycode': [18, 17]})

    def test_rotate(self):
        print(self.driver.orientation)
        # 横屏
        self.driver.orientation = 'LANDSCAPE'
        print(self.driver.orientation)
        # 竖屏
        self.driver.orientation = 'PORTRAIT'
        print(self.driver.orientation)

    def test_lock(self):
        self.driver.execute_script('mobile: lock')

    def test_wakeup(self):
        self.driver.execute_script('mobile: wakeUp')

    def test_get_power_capacity(self):
        print(self.driver.execute_script("mobile: getPowerCapacity"))

    def test_get_screenshot(self):
        # 端侧设备支持jpeg，写入文件是png，好像也能正常显示
        self.driver.get_screenshot_as_file('screen.png')

    def test_is_locked(self):
        print('isLocked:', self.driver.is_locked())

    def test_unlock(self):
        self.driver.unlock()

    def test_lock(self):
        self.driver.lock(2)

    def test_swipe(self):
        self.driver.swipe(100, 100, 100, 500, 1)

    def test_display_size(self):
        # 获取屏幕分辨率
        print(self.driver.execute_script('mobile: getDisplaySize', {}))

    def test_shell(self):
        print(self.driver.execute_script(
            'mobile: shell', {'command': 'whoami'}))

        # 可选配置超时时间，单位（毫秒）
        print(self.driver.execute_script('mobile: shell',
              {'command': 'whoami', 'timeout': 5 * 1000}))

    def test_gesture_click(self):
        """点击
        elementId: 控件ID，若缺少控件ID，需指定点击坐标
        x: 控件x坐标
        y: 控件y坐标
        """
        # 使用方式1
        self.driver.find_elements('text', value='WLAN').click()

        # 使用方式2
        # self.driver.execute_script(
        #     'mobile: clickGesture', {'x': 500, 'y': 600})

        # 使用方式3
        # el = self.driver.find_elements(
        #     'HypiumBy', value='BY.isBefore(BY.text("设置")).type("Image")')[-1]
        # self.driver.execute_script(
        #     'mobile: clickGesture', {'elementId': el.id})

    def test_gesture_doubleclick(self):
        """双击。测试场景：计算器点击数字“7”
        elementId: 被点击的控件ID，若缺少控件ID，需指定点击坐标
        x: 控件x坐标
        y: 控件y坐标
        """
        # 使用方式1
        self.driver.execute_script(
            'mobile: doubleClickGesture', {'x': 192, 'y': 1613})

        # 使用方式2
        el = self.driver.find_element('text', value='7')
        self.driver.execute_script(
            'mobile: doubleClickGesture', {'elementId': el.id})

    def test_gesture_longclick(self):
        """长按
        elementId: 被点击的控件ID，若缺少控件ID，需指定点击坐标
        x: 控件x坐标
        y: 控件y坐标
        duration：按压时长（单位毫秒），默认值2000
        """
        # 使用方式1
        self.driver.execute_script(
            'mobile: longClickGesture', {'x': 500, 'y': 600})

        # 使用方式2
        self.driver.execute_script(
            'mobile: longClickGesture', {'x': 500, 'y': 600, 'duration': 2000})

        # 使用方式3
        # el = self.driver.find_elements(
        #     'HypiumBy', value='BY.isBefore(BY.text("主题")).type("Image")')[-1]
        # self.driver.execute_script(
        #     'mobile: longClickGesture', {'elementId': el.id})

    def test_gesture_drag(self):
        """拖拽。测试场景：打开设置，进入屏幕亮度调节界面
        elementId: 被拖动的控件ID，若缺少控件ID，需指定起始坐标
        startX: 起始x坐标
        startY: 起始y坐标
        endX: 终止x坐标
        endY: 终止y坐标
        speed: 拖动速度（单位像素点），默认值2500
        """
        # 使用方式1
        self.driver.execute_script(
            'mobile: dragGesture', {'startX': 300, 'startY': 640, 'endX': 800, 'endY': 640, 'speed': 2500})

        # 使用方式2
        # el = self.driver.find_element(
        #     'key', value='brightness_slider')
        # self.driver.execute_script(
        #     'mobile: dragGesture', {'elementId': el.id, 'endX': 800, 'endY': 640})

    def test_gesture_swipe(self):
        # 使用方式1
        # el = self.driver.find_element('key', value='brightness_slider')
        # 调暗
        # self.driver.execute_script('mobile: swipeGesture', {'elementId': el.id, 'direction': 'left', 'percent': 0.75})
        # 调亮
        # self.driver.execute_script('mobile: swipeGesture', {'elementId': el.id, 'direction': 'right', 'percent': 0.75})

        # 使用方式2
        size = self.driver.execute_script('mobile: getDisplaySize')
        width, height = size.get('width'), size.get('height')
        # 上滑返回桌面
        self.driver.execute_script('mobile: swipeGesture', {
                                   'left': 0, 'top': 0, 'width': width, 'height': height, 'direction': 'up', 'percent': 0.1})

        # 向上滑动
        # self.driver.execute_script('mobile: swipeGesture', {'left': 0, 'top': 0.25 * height, 'width': width, 'height': 0.5 * height, 'direction': 'up', 'percent': 0.75})

        # 向下滑动
        # self.driver.execute_script('mobile: swipeGesture', {'left': 0, 'top': 0.25 * height, 'width': width, 'height': 0.5 * height, 'direction': 'down', 'percent': 0.75})

        # 侧滑返回
        # self.driver.execute_script('mobile: swipeGesture', {'left': 0, 'top': 0.25 * height, 'width': width, 'height': 0.5 * height, 'direction': 'right', 'percent': 0.1})

        # 向左滑动
        # self.driver.execute_script('mobile: swipeGesture', {'left': 0.25 * width, 'top': 0.25 * height, 'width': 0.5 * width, 'height': 0.5 * height, 'direction': 'left', 'percent': 0.75})

        # 向右滑动
        # self.driver.execute_script('mobile: swipeGesture', {'left': 0.25 * width, 'top': 0.25 * height, 'width': 0.5 * width, 'height': 0.5 * height, 'direction': 'right', 'percent': 0.75})

        # self.driver.execute_script('mobile: swipeBack')
        # self.driver.execute_script('mobile: swipeHome')

        # self.driver.execute_script('mobile: slideScreen', {'direction': 'up'})

    def test_catchDeviceLogs(self):
        """需要在capabilities里添加配置{appium:getDeviceLogs': True, 'appium:getDeviceLogsToPath': 'D:\\test'}
        getDeviceLogs，设为True抓取日志，设为False不抓取日志；
        getDeviceLogsToPath，可选将设备日志拉到指定目录（适用于用例运行环境和设备接入环境是在同一台电脑），若未指定路径，则会返回日志的zip压缩文件流
        """
        # 使用方式1
        self.driver.execute_script('mobile: getDeviceLogs', {})

        # 使用方式2
        # logItems: dict，可选配置抓取多个路径下的日志
        # key是日志路径可以是文件，也可以是目录；value是创建子文件夹保存拉取得日志，设为空，表示不使用子文件夹
        # self.driver.execute_script(
        #     'mobile: getDeviceLogs', {'logItems': {'path1': '', 'path2': 'onfolder'}})

        # 使用方式3
        # 返回zip压缩文件流
        # ret = self.driver.execute_script('mobile: getDeviceLogs', {})
        # with open('D:\\test.zip', "wb") as fzip:
        #     data = bytes(ret.get('data'))
        #     fzip.write(data)

    def test_recording_screen(self):
        self.driver.start_recording_screen()
        time.sleep(10)
        ret = self.driver.stop_recording_screen()
        with open('D:\\test.mp4', 'wb') as mp4_file:
            mp4_file.write(base64.b64decode(ret))


if __name__ == '__main__':
    unittest.main()

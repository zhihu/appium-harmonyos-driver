# appium-harmonyos-driver

## 安装说明

### 安装Node.js
安装最新版本即可

### 安装appium

```shell
# 全局方式安装
npm i appium -g
```

### 安装appium-harmonyos-driver

1. 下载DevEco Testing Hypium {version} Release，https://developer.huawei.com/consumer/cn/download/
2. 解压找到hypium-js-{version}.zip，解压安装hypium-{version}.tgz
3. 在本项目的路径下，新建终端控制台
4. 运行命令，安装hypium-driver
```shell
npm install /path/to/hypium-{version}.tgz
```
5. 运行命令，安装项目的依赖
```shell
npm i
```
6. 运行命令，卸载appium-harmonyos-driver（若之前安装过，需先卸载）
```shell
appium driver uninstall harmonyos
```
7. 运行命令，安装appium-harmonyos-driver
```shell
# 注意：不能在/path/to/appium-harmonyos-driver下运行此命令
appium driver install --source=local /path/to/appium-harmonyos-driver
```

## 启动appium
在终端控制台运行
```shell
appium
```

## Capability说明

Capability Name | Description
--- | ---
platformName | 固定填写harmonyos
appium:automationName | 固定填写harmonyos
appium:udid | 在指定SN的设备上运行，不指定SN，则使用hdc list targets列出的第一个设备
appium:getDeviceLogs | 是否抓取设备日志，true抓取，false不抓取
appium:getDeviceLogsToPath | 将设备日志拉到指定目录，如D:\test
appium:waitForWebviewMs | 等待webview时间
chromedriverExecutableDir | 配置chromedriver的文件目录

## 创建驱动对象（Python）
安装依赖
```cmd
pip install Appium-Python-Client
```
创建driver
```python
from appium import webdriver
from appium.options.common.base import AppiumOptions

capabilities = {
    'platformName': 'harmonyos',
    'appium:automationName': 'harmonyos'
}
appium_server_url = 'http://localhost:4723'
options = AppiumOptions()
options.load_capabilities(capabilities)
driver = webdriver.Remote(appium_server_url, options=options)
```

## UI控件

### 设置隐式等待时间

```python
# 设置隐式等待时间
driver.implicitly_wait(5)
# 获取超时时间
print(driver.timeouts)
```

### 查找单个控件

```python
# 使用text属性查找控件
driver.find_element('text', '搜索设置项')
# 使用type属性查找控件
driver.find_element('type', 'SearchField')
# 使用key属性查找控件
driver.find_element("key", 'bluetooth_entry.title')
# 使用id属性查找控件
driver.find_element("id", 'AppIcon_Image_com.sankuai.hmeituan_872415237_0')
# 使用HypiumBy表达式（组合条件）查找控件
driver.find_element('HypiumBy', 'BY.isBefore(BY.text("设置")).type("Image")')
```

### 查找多个控件

```python
# 使用text属性查找控件
driver.find_elements('text', '搜索设置项')
# 使用type属性查找控件
driver.find_elements('type', 'SearchField')
# 使用key属性查找控件
driver.find_elements("key", 'bluetooth_entry.title')
# 使用id属性查找控件
driver.find_elements("id", 'AppIcon_Image_com.sankuai.hmeituan_872415237_0')
# 使用HypiumBy表达式（组合条件）查找控件
driver.find_elements('HypiumBy', 'BY.isBefore(BY.text("设置")).type("Image")')
```

### 获取控件属性

```python
el = driver.find_element('text', '搜索设置项')
print(el.rect)              # 控件边界矩形，{"x":189,"y":593,"width":280,"height":66}
print(el.size)              # 控件宽度高度，{"width":280,"height":66}
print(el.location)          # 控件左上坐标，{"x":189,"y":593}
print(el.location_in_view)  # 控件中心坐标，{"x":329,"y":626}
print(el.is_enabled())
print(el.is_selected())
for key in ['text', 'id', 'key', 'type', 'clickable', 'scrollable', 'checked', 'checkable', 'enabled']:
    print(f'{key}={el.get_attribute(key)}')
```
### 点击

```python
driver.find_element('text', '搜索设置项').click()
```

### 输入文本

```python
driver.find_element("type", "SearchField").send_keys("exit simple 测试文本")
```
参数说明：
- text, 需要输入的内容
- x, 需要点击的坐标x(可选)
- y, 需要点击的坐标y(可选)
- 如果处于焦点状况，无需指定坐标
, 处于非焦点状态需要指定坐标, 会先点击后获取焦点，再输入文本

```python
driver.execute_script('mobile: inputText', {'text': '123'})
driver.execute_script('mobile: inputText', {'text': '123', 'x': 100, 'y': 200})
```

## 手势接口

### 点击
参数说明：
- elementId, 控件Id。若传参未包含控件Id，则必须提供坐标。若传参同时包含控件Id和坐标，那么传入的坐标将会被忽略
- x, 偏移坐标x
- y, 偏移坐标y

```python
# 使用方式1
driver.execute_script('mobile: clickGesture', {'x': 500, 'y': 600})

# 使用方式2
el = driver.find_element('text', 'xxx')
driver.execute_script('mobile: clickGesture', {'elementId': el.id})
```

### 双击
参数说明：
- elementId, 控件Id。若传参未包含控件Id，则必须提供坐标。若传参同时包含控件Id和坐标，那么传入的坐标将会被忽略
- x, 偏移坐标x
- y, 偏移坐标y

```python
# 使用方式1
driver.execute_script('mobile: doubleClickGesture', {'x': 500, 'y': 600})

# 使用方式2
el = driver.find_element('text', 'xxx')
driver.execute_script('mobile: doubleClickGesture', {'elementId': el.id})
```

### 长按
参数说明：
- elementId, 控件Id。若传参未包含控件Id，则必须提供坐标。若传参同时包含控件Id和坐标，那么传入的坐标将会被忽略
- x, 偏移坐标x
- y, 偏移坐标y
- duration, 按压时长，单位毫秒，默认值2000

```python
# 使用方式1
driver.execute_script('mobile: longClickGesture', {'x': 500, 'y': 600})

# 使用方式2
driver.execute_script('mobile: longClickGesture', {'x': 500, 'y': 600, 'duration': 3000})

# 使用方式3
el = driver.find_element('text', 'xxx')
driver.execute_script('mobile: longClickGesture', {'elementId': el.id})
```

### 多次点击
参数说明：
- elementId, 控件Id。若传参未包含控件Id，则必须提供坐标。若传参同时包含控件Id和坐标，那么传入的坐标将会被忽略
- x, 偏移坐标x
- y, 偏移坐标y
- times, 点击次数 默认3次
# 使用方式1
driver.execute_script('mobile: multipleClickGesture', {'x': 500, 'y': 600})

# 使用方式2
driver.execute_script('mobile: multipleClickGesture', {'x': 500, 'y': 600, 'times': 4})

# 使用方式3
el = driver.find_element('text', 'xxx')
driver.execute_script('mobile: multipleClickGesture', {'elementId': el.id})
```

### drag
参数说明：
- elementId, 控件Id。若传参未包含控件Id，则必须提供起始坐标。若传参同时包含控件Id和起始坐标，那么传入的起始坐标将会被忽略
- startX, 起始坐标x
- startY, 起始坐标y
- endX, 终止坐标x
- endY, 终止坐标y
- speed, 拖动速度，默认值2500

```python
# 使用方式1
driver.execute_script('mobile: dragGesture', {'startX': 300, 'startY': 640, 'endX': 800, 'endY': 640, 'speed': 2500})

# 使用方式2
el = driver.find_element('key', value='brightness_slider')
driver.execute_script('mobile: dragGesture', {'elementId': el.id, 'endX': 800, 'endY': 640})
```

### swipe
参数说明：
- elementId, 控件Id。若传参未包含控件Id，则必须提供滑动边界区域。若传参同时包含控件Id和起始坐标，那么传入的滑动边界区域将会被忽略
- left, 滑动区域的左坐标
- top, 滑动区域的顶部坐标
- width, 滑动边界区域的宽度
- height, 滑动边界区域的高度
- direction, 滑动方向up、down、left、right（不区分大小写）。必填值
- percent, 滑动距离占滑动区域大小的百分比。有效值必须是0..1范围内的浮点数，其中1.0表示100%。必填值
- speed, 手势执行速度。该值不得为负数。默认值是5000

```python
# 使用方式1
el = driver.find_element('key', value='brightness_slider')
# 调暗，测试失败
driver.execute_script('mobile: swipeGesture', {'elementId': el.id, 'direction': 'left', 'percent': 0.5})
# 调亮
driver.execute_script('mobile: swipeGesture', {'elementId': el.id, 'direction': 'right', 'percent': 0.5})

# 使用方式2
size = driver.execute_script('mobile: getDisplaySize')
width, height = size.get('width'), size.get('height')
# 上滑返回桌面
driver.execute_script('mobile: swipeGesture', {'left': 0, 'top': 0, 'width': width, 'height': height, 'direction': 'up', 'percent': 0.1})

# 向上滑动
driver.execute_script('mobile: swipeGesture', {'left': 0, 'top': 0.25 * height, 'width': width, 'height': 0.5 * height, 'direction': 'up', 'percent': 0.75})

# 向下滑动
driver.execute_script('mobile: swipeGesture', {'left': 0, 'top': 0.25 * height, 'width': width, 'height': 0.5 * height, 'direction': 'down', 'percent': 0.75})

# 侧滑返回
driver.execute_script('mobile: swipeGesture', {'left': 0, 'top': 0.25 * height, 'width': width, 'height': 0.5 * height, 'direction': 'right', 'percent': 0.1})

# 向左滑动
driver.execute_script('mobile: swipeGesture', {'left': 0.25 * width, 'top': 0.25 * height, 'width': 0.5 * width, 'height': 0.5 * height, 'direction': 'left', 'percent': 0.75})

# 向右滑动
driver.execute_script('mobile: swipeGesture', {'left': 0.25 * width, 'top': 0.25 * height, 'width': 0.5 * width, 'height': 0.5 * height, 'direction': 'right', 'percent': 0.75})
```

### swipeBack（侧滑返回）

```python
driver.execute_script('mobile: swipeBack')
```

### swipeHome（上滑返回桌面）

```python
driver.execute_script('mobile: swipeHome')
```

### slideScreen（滑动屏幕）
参数说明：
- direction, 滑动方向。up显示上方屏幕、down显示下方屏幕、left显示左侧屏幕、right显示右侧屏幕（不区分大小写）。必填值
- percent, 滑动距离占滑动区域大小的百分比。有效值必须是0..1范围内的浮点数，其中1.0表示100%。默认值为0.5
- times, 滑动次数。有效值必须是大于等于1的整数。默认值为1

```python
# 显示上方屏幕
driver.execute_script('mobile: slideScreen', {'direction': 'up'})

# 显示下方屏幕
driver.execute_script('mobile: slideScreen', {'direction': 'down'})

# 显示左侧屏幕
driver.execute_script('mobile: slideScreen', {'direction': 'left'})

# 显示右侧屏幕
driver.execute_script('mobile: slideScreen', {'direction': 'right'})
```

### scroll
参数说明：
- elementId, 控件Id。若传参未包含控件Id，则必须提供滑动边界区域。若传参同时包含控件Id和起始坐标，那么传入的滑动边界区域将会被忽略
- left, 滑动区域的左坐标
- top, 滑动区域的顶部坐标
- width, 滑动边界区域的宽度
- height, 滑动边界区域的高度
- direction, 滑动方向up、down、left、right（不区分大小写）。必填值
- percent, 滑动距离占滑动区域大小的百分比。有效值必须是0..1范围内的浮点数，其中1.0表示100%。必填值
- speed, 手势执行速度。该值不得为负数。默认值是5000

```python
size = driver.execute_script('mobile: getDisplaySize')
width, height = size.get('width'), size.get('height')

# 向上滑动（显示上方屏幕）
driver.execute_script('mobile: scrollGesture', {'left': 0, 'top': 0.25 * height, 'width': width, 'height': 0.5 * height, 'direction': 'up', 'percent': 0.75})

# 向下滑动（显示下方屏幕）
driver.execute_script('mobile: scrollGesture', {'left': 0, 'top': 0.25 * height, 'width': width, 'height': 0.5 * height, 'direction': 'down', 'percent': 0.75})

# 向左滑动（显示左侧屏幕）
driver.execute_script('mobile: scrollGesture', {'left': 0.25 * width, 'top': 0.25 * height, 'width': 0.5 * width, 'height': 0.5 * height, 'direction': 'left', 'percent': 0.75})

# 向右滑动（显示右侧屏幕）
driver.execute_script('mobile: scrollGesture', {'left': 0.25 * width, 'top': 0.25 * height, 'width': 0.5 * width, 'height': 0.5 * height, 'direction': 'right', 'percent': 0.75})
```

### 双指放大
todo

### 双指缩小
todo

## 设备相关

### 运行shell命令
参数说明：
- command, 待运行的shell命令
- timeout, 设置命令超时，单位毫米，默认值300000（300秒）

```python
# 使用方式1
driver.driver.execute_script('mobile: shell', {'command': 'whoami'})

# 使用方式2
driver.driver.execute_script('mobile: shell', {'command': 'whoami', 'timeout': 5000})
```

### 截图

```python
# 使用方式1
driver.get_screenshot_as_file('screen.png')

# 使用方式2
print(driver.get_screenshot_as_base64())
```

### 返回

```python
driver.back()
```

### 按键
参数说明：
- keycode, 按键码
- isLongPress, 是否长按，True长按，False非长按
- duration, 按压时长，单位毫秒，默认值2000

```python
# 按Home键
driver.press_keycode(1)

# 长按电源键
driver.long_press_keycode(18)

# 长按电源键
driver.execute_script('mobile: pressKey', {'keycode': 18, 'isLongPress': True, 'duration': 3000})
```

### 按组合键
参数说明：
- keycode, 按键码

```python
# 按电源键18 + 音量下键17
driver.execute_script('mobile: pressCombineKeys', {'keycode': [18, 17]})
```

### 唤醒屏幕
```python
driver.execute_script('mobile: wakeUp')
```

### 锁定屏幕

```python
driver.lock()
```

### 解锁屏幕

```python
driver.unlock()
```

### 获取屏幕锁定状态

```python
print(driver.is_locked())
```

### 获取屏幕横竖屏状态

```python
print(driver.orientation)
```

### 设置屏幕横竖屏状态

```python
# 设置为横屏
driver.orientation = 'LANDSCAPE'

# 设置为竖屏
driver.orientation = 'PORTRAIT'
```

### 获取设备日志
参数说明：
- logItems, 传参为字典，除hilog外，还需额外拉取的文件。key可以是文件路径，也可以是目录；value是创建子文件夹保存拉取的文件，设为空，表示不使用子文件夹

```python
capabilities = {
    # 是否抓取设备日志, True/False
    'appium:getDeviceLogs': True,
    # 将设备日志拉到指定目录（适用于用例运行环境和设备接入环境是在同一台电脑），若未指定路径，则会返回日志的zip压缩文件流
    'appium:getDeviceLogsToPath': 'D:\\test'
}

# 使用方式1
driver.execute_script('mobile: getDeviceLogs', {})

# 使用方式2
driver.execute_script('mobile: getDeviceLogs', {'logItems': {'path1': '', 'path2': 'onfolder'}})

# 使用方式3
ret = driver.execute_script('mobile: getDeviceLogs', {})
with open('D:\\test.zip', "wb") as fzip:
    data = bytes(ret.get('data'))
    fzip.write(data)
```

### 获取设备时间

```python
print(driver.get_device_time())

print(driver.get_device_time('YYYY-MM-DD'))
```

### 获取电池电量

```python
print(driver.execute_script('mobile: getPowerCapacity'))
```

### 获取屏幕密度

```python
print(driver.get_display_density())
```

### 获取屏幕分辨率

```python
print(driver.execute_script('mobile: getDisplaySize'))
```

### 获取屏幕宽高

```python
print(driver.get_window_rect())
print(driver.get_window_size())
```

## 应用相关

### 安装应用

```python
driver.install_app('path-to-hap')
```

### 卸载应用

```python
driver.remove_app('应用包名')
```

### 启动应用
参数说明：
- bundleId, 应用包名
- abilityId, 应用abilityId

```python
driver.execute_script('mobile: activateApp', {'bundleId': '应用包名', 'abilityId': '应用abilityId'})
```

### 停止应用

```python
driver.terminate_app('应用包名')
```

### 删除应用数据
参数说明：
- bundleId, 应用包名

```python
driver.execute_script('mobile: clearApp', {'bundleId': '应用包名'})
```

### 查询应用是否已安装

```python
print(driver.is_app_installed('应用包名'))
```

### 查询应用状态

```python
print(driver.query_app_state('应用包名'))
```

### 获取当前应用Activity

```python
print(driver.current_activity)
```

### 获取当前应用包名

```python
print(driver.current_package)
```

## 文件相关

### 推送文件

```python
driver.push_file('/data/local/tmp/test.txt', source_path='D:\\test.txt')
```

### 拉取文件

```python
driver.pull_file('/data/local/tmp/test.txt')
```

### 拉取文件夹

```python
# 返回zip压缩包的base64字符串
ret = driver.pull_file('/data/local/tmp')
with ZipFile(BytesIO(base64.b64decode(ret))) as fzip:
    for filename in fzip.namelist():
        print(filename)
```

### 删除文件

```python
driver.execute_script('mobile: deleteFile', {'remotePath': '/data/local/tmp/test.txt'})
```

## Webview相关

### 获取可用context

```python
print(driver.contexts)
```

### 获取当前context

```python
print(driver.current_context)
```

### 切换context

```python
# 切换到webview模式
driver.switch_to.context('WEBVIEW_com.huawei.hmos.browser')
# 切换到原生控件模式
driver.switch_to.context(None)
```

### 查找webview控件

```python
# 打开百度首页
driver.get('https://www.baidu.com/')
    
# 使用By.CLASS_NAME条件查找控件和点击控件
driver.find_element(By.CLASS_NAME, 'square-enterance').click()
    
# 使用By.XPATH条件查找控件和点击控件
driver.find_element(By.XPATH, '/html/body/div/div/div[1]/div/h3/a').click()
    
# 使用By.ID条件查找控件和输入文本
driver.find_element(By.ID, 'index-kw').send_keys('鸿蒙')

# 使用By.ID条件查找控件和点击控件
driver.find_element(By.ID, 'index-bn').click()
```

### 示例代码

```python

import time

from appium import webdriver
from appium.options.common.base import AppiumOptions
from appium.webdriver.common.touch_action import TouchAction
from selenium.webdriver.common.by import By


capabilities = {
    'platformName': 'harmonyos',
    'appium:automationName': 'harmonyos',
    # 'appium:udid': 'device sn',
    # 等待webview时间
    'appium:waitForWebviewMs': 5 * 1000,
    # 可选配置参数chromedriverExecutableDir，配置chromedriver的文件目录
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

    el = driver.find_elements(
        by='HypiumBy', value='BY.isBefore(BY.text("设置")).type("Image")')
    action = TouchAction(driver)
    action.tap(el[-1]).perform()


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
```
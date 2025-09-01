# 鸿蒙UI自动化测试示例

本项目是一个基于Appium的鸿蒙(HarmonyOS)UI自动化测试示例，使用Java语言实现。

## 项目结构

```
javaclient/
├── pom.xml                                           # Maven配置文件
├── testng.xml                                        # TestNG测试套件配置
├── src/
│   ├── main/java/appium/harmonyos/                   # 鸿蒙驱动类
│   │   ├── HarmonyDriver.java                        # 鸿蒙驱动器
│   │   ├── HypiumBy.java                            # 鸿蒙元素定位器
│   │   ├── HarmonyKey.java                          # 鸿蒙按键枚举
│   │   └── HarmonyKeyEvent.java                     # 鸿蒙按键事件
│   └── test/java/com/harmony/automation/testcase/
│       └── HarmonyUITest.java                       # 测试用例示例
└── README.md                                        # 本文档
```

## 环境要求

### 必需软件
- **Java**: JDK 11或更高版本
- **Maven**: 3.6.0或更高版本
- **Appium Server**: 2.x版本
- **鸿蒙设备**: 已连接并启用开发者模式的鸿蒙设备

### 鸿蒙设备配置
1. 在鸿蒙设备上启用开发者选项
2. 开启USB调试
3. 确保设备通过USB连接到电脑
4. 确保可以通过hdc命令连接设备

## 安装和配置

### 1. 克隆项目
```bash
git clone <项目地址>
cd appium-harmoryos-driver/javaclient
```

### 2. 安装Maven依赖
```bash
mvn clean install
```

### 3. 启动Appium服务器
```bash
# 使用默认端口4723启动
appium

# 或者指定端口
appium --port 4723
```

### 4. 连接鸿蒙设备
```bash
# 检查设备连接
hdc list targets

# 如果设备已连接，应该显示设备ID
```

## 运行测试

### 使用Maven运行
```bash
# 运行所有测试
mvn test

# 运行指定测试类
mvn test -Dtest=HarmonyUITest
```

### 使用TestNG运行
```bash
# 通过TestNG XML配置运行
mvn test -DsuiteXmlFile=testng.xml
```

## 测试用例说明

`HarmonyUITest.java` 包含以下测试示例：

1. **testClickByText()**: 通过文本定位元素并点击
   - 定位WLAN元素并点击
   
2. **testInputByKey()**: 通过key定位元素并输入文本
   - 在搜索框中输入文本
   
3. **testFindByType()**: 通过元素类型定位
   - 查找Button类型的元素
   
4. **testSystemKeys()**: 系统按键操作
   - 执行Back键和Home键操作
   
5. **testAppManagement()**: 应用管理操作
   - 启动和关闭应用
   
6. **testElementExistence()**: 元素存在性验证
   - 验证页面元素是否存在

## 核心类介绍

### HarmonyDriver
鸿蒙UI自动化驱动器，继承自Appium的AppiumDriver，提供鸿蒙设备特有的功能。

### HypiumBy
鸿蒙元素定位器，提供以下定位方式：
- `HypiumBy.text("文本")`: 通过文本定位
- `HypiumBy.key("键名")`: 通过key定位
- `HypiumBy.type("类型")`: 通过元素类型定位
- `HypiumBy.options("选项")`: 通过HypiumBy选项定位

### HarmonyKey 和 HarmonyKeyEvent
提供鸿蒙系统按键操作：
- `HarmonyKey.HOME`: Home键
- `HarmonyKey.BACK`: Back键
- `HarmonyKey.VOLUME_UP`: 音量+键
- `HarmonyKey.VOLUME_DOWN`: 音量-键
- `HarmonyKey.POWER`: 电源键

## 配置说明

### Appium Capabilities
```java
DesiredCapabilities capabilities = new DesiredCapabilities();
capabilities.setCapability(MobileCapabilityType.PLATFORM_NAME, "harmonyos");
capabilities.setCapability("appium:automationName", "harmonyos");
capabilities.setCapability("appium:deviceName", "HarmonyOS Device");
capabilities.setCapability("appium:newCommandTimeout", 180);

// 可选：启动特定应用，默认session创建即打开对应app
capabilities.setCapability("appium:bundleId", "com.huawei.hmos.settings");
capabilities.setCapability("appium:abilityId", "com.huawei.hmos.settings.MainAbility");
```
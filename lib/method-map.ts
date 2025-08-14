/**
 * @privateRemarks This was created by hand from the type definitions in `lib/commands` here and in `appium-harmonyos-driver`.
 * @module
 */

export const executeMethodMap = {
  'mobile: shell': {
    command: 'shell',
    params: {
      required: ['command'],
      optional: ['timeout'],
    },
  },
  'mobile: activateApp': {
    command: 'mobileActivateApp',
    params: {
      required: ['bundleId'],
    },
  },
  'mobile: terminateApp': {
    command: 'mobileTerminateApp',
    params: {
      required: ['bundleId'],
      optional: ['timeout'],
    },
  },
  'mobile: backgroundApp': {
    command: 'mobileBackgroundApp',
    params: {
      optional: ['seconds'],
    },
  },
  'mobile: clearApp': {
    command: 'mobileClearApp',
    params: {
      required: ['bundleId'],
    },
  },
  'mobile: queryAppState': {
    command: 'mobileQueryAppState',
    params: {
      required: ['bundleId'],
    },
  },
  'mobile: installApp': {
    command: 'mobileInstallApp',
    params: {
      required: ['appPath'],
      optional: ['timeout', 'allowTestPackages', 'useSdcard', 'grantPermissions', 'replace', 'checkVersion'],
    },
  },
  'mobile: removeApp': {
    command: 'mobileRemoveApp',
    params: {
      required: ['bundleId'],
    },
  },
  'mobile: isAppInstalled': {
    command: 'mobileIsAppInstalled',
    params: {
      required: ['bundleId'],
    },
  },
  'mobile: getCurrentActivity': {
    command: 'getCurrentActivity',
  },
  'mobile: getCurrentPackage': {
    command: 'getCurrentPackage',
  },
  'mobile: clickGesture': {
    command: 'mobileClickGesture',
    params: {
      optional: ['elementId', 'x', 'y'],
    },
  },
  'mobile: doubleClickGesture': {
    command: 'mobileDoubleClickGesture',
    params: {
      optional: ['elementId', 'x', 'y'],
    },
  },
  'mobile: longClickGesture': {
    command: 'mobileLongClickGesture',
    params: {
      optional: ['elementId', 'x', 'y', 'duration'],
    },
  },
  'mobile: multipleClickGesture': {
    command: 'mobileMultipleClickGesture',
    params: {
      optional: ['elementId', 'x', 'y', 'times'],
    },
  },
  'mobile: pinchCloseGesture': {
    command: 'mobilePinchCloseGesture',
    params: {
      required: ['percent'],
      optional: ['elementId', 'left', 'top', 'width', 'height', 'speed']
    },
  },
  'mobile: pinchOpenGesture': {
    command: 'mobilePinchOpenGesture',
    params: {
      required: ['percent'],
      optional: ['elementId', 'left', 'top', 'width', 'height', 'speed']
    },
  },
  'mobile: dragGesture': {
    command: 'mobileDragGesture',
    params: {
      optional: ['elementId', 'startX', 'startY', 'endX', 'endY', 'speed']
    },
  },
  'mobile: scrollGesture': {
    command: 'mobileScrollGesture',
    params: {
      required: ['elementId', 'left', 'top', 'width', 'height', 'direction', 'percent', 'speed']
    },
  },
  'mobile: swipeGesture': {
    command: 'mobileSwipeGesture',
    params: {
      required: ['elementId', 'left', 'top', 'width', 'height', 'direction', 'percent', 'speed']
    },
  },
  'mobile: swipeBack': {
    command: 'swipeBack'
  },
  'mobile: swipeHome': {
    command: 'swipeHome'
  },
  'mobile: slideScreen': {
    command: 'slideScreen',
    params: {
      required: ['direction', 'percent', 'times']
    },
  },
  'mobile: pullFile': {
    command: 'pullFile',
    params: {
      required: ['remotePath'],
    },
  },
  'mobile: pullFolder': {
    command: 'pullFolder',
    params: {
      required: ['remotePath'],
    },
  },
  'mobile: pushFile': {
    command: 'pushFile',
    params: {
      required: ['remotePath', 'payload'],
    },
  },
  'mobile: deleteFile': {
    command: 'deleteFile',
  },
  'mobile: isLocked': {
    command: 'mobileIsLocked',
  },
  'mobile: lock': {
    command: 'mobileLock',
    params: {
      required: ['seconds'],
    },
  },
  'mobile: unlock': {
    command: 'mobileUnlock',
  },
  'mobile: wakeUp': {
    command: 'mobileWakeUp',
  },
  'mobile: pressKey': {
    command: 'pressKey',
    params: {
      required: ['keycode'],
      optional: ['metastate', 'flags', 'isLongPress'],
    },
  },
  'mobile: pressCombineKeys': {
    command: 'pressCombineKeys',
    params: {
      required: ['keycode']
    },
  },
  'mobile: inputText': {
    command: 'inputText',
    params: {
      required: ['text'],
      optional: ['x', 'y'],
    },
  },
  'getScreenshot': {
    command: 'getScreenshot',
  },
  'getOrientation': {
    command: 'getOrientation',
  },
  'setOrientation': {
    command: 'setOrientation',
    params: {
      required: ['rotation'],
    },
  },
  'mobile: getDeviceTime': {
    command: 'getDeviceTime',
    params: {
      optional: ['format'],
    },
  },
  'mobile: getDeviceLogs': {
    command: 'getDeviceLogs',
    params: {
      optional: ['logItems'],
    },
  },
  'mobile: getDisplayDensity': {
    command: 'getDisplayDensity',
  },
  'mobile: getDisplaySize': {
    command: 'getDisplaySize',
  },
  'mobile: getPowerCapacity': {
    command: 'getPowerCapacity',
  },
  'getContexts': {
    command: 'getContexts',
    params: {
      optional: ['waitForWebviewMs'],
    },
  },
  'mobile: startLogsBroadcast': {
    command: 'startLogsBroadcast',
  },
  'mobile: stopLogsBroadcast': {
    command: 'stopLogsBroadcast',
  },
} as const;

export type HarmonyosExecuteMethodMap = typeof executeMethodMap;

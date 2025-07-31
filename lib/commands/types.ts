export interface WebviewsMapping {
  packageName: string;
  processId: string;
  socketName: string;
  webviewName: string;
  /**
   * @example
   *
   * ```json
   * {
   *   "packageName": "com.xxx",
   *   "processId": "22138",
   *   "socketName": "@webview_devtools_remote_22138",
   *   "webviewName": "WEBVIEW_${packageName}"
   * }
   * ```
   */
}

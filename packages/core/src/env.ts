import { Platform, PlatformSpec, ScriptEngine, System } from "./enum.js";
import {
    isAndroid,
    isBrowser,
    isBun,
    isHarmonyOS,
    isIOS,
    isLinux,
    isMac,
    isNodeJS,
    isNodeJSLike,
    isOpenHarmony,
    isW3C,
    isWechat,
    isWindows,
    isWinterTC,
} from "./guard.js";

/**
 * 当前平台
 */
export const platform = isWechat()
    ? Platform.Wechat
    : isBrowser()
      ? Platform.Browser
      : isBun()
        ? Platform.Bun
        : isNodeJS()
          ? Platform.NodeJS
          : Platform.Unknown;

/**
 * 当前系统
 */
export const system = isAndroid()
    ? System.Android
    : isIOS()
      ? System.IOS
      : isWindows()
        ? System.Windows
        : isMac()
          ? System.Mac
          : isLinux()
            ? System.Linux
            : isHarmonyOS()
              ? System.HarmonyOS
              : isOpenHarmony()
                ? System.OpenHarmony
                : System.Unknown;

/**
 * 当前脚本引擎
 */
export const scriptEngine = ScriptEngine.Unknown;

/**
 * 当前平台符合的规范
 */
export const platformSpecs = new Set<PlatformSpec>(
    [
        isWinterTC() && PlatformSpec.WinterTC,
        isNodeJSLike() && PlatformSpec.NodeJSLike,
        isW3C() && PlatformSpec.W3C,
    ].filter(Boolean) as PlatformSpec[],
);

/**
 * 最大可同时运行 {@link Worker} 数量
 */
export const MAX_WORKER_COUNT = isWechat() ? 1 : Number.POSITIVE_INFINITY;

/**
 * 最大调用栈大小
 *
 * 当无法拿到真实值时会返回一个相对安全值：`10000`
 */
export const MAX_CALLSTACK_SIZE = 10000;

/**
 * 当前环境名称
 *
 * @example 已知平台与系统
 * `NodeJS(MacOS)`
 * `Browser(Unknown)`
 * @example 平台未知
 * `MacOS`
 * `Unknown`
 */
export const ENV_NAME =
    platform === Platform.Unknown ? system : `${platform}(${system})`;

// TODO NodeJS 18.0; MacOS 12.0; v8 9.0...
// export const envDesc =

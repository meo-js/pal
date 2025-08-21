/** @ctix-exclude */

import * as ccenv from "cc/env";
import { COCOS, NODE } from "compile-constant";
import node_os from "os";
import { Platform, PlatformSpec, System } from "./enum.js";

// 某些平台独有的全局变量用于平台识别
declare const wx: unknown;

// 规范

/**
 * 是否处于 {@link PlatformSpec.NodeJSLike} 平台
 */
export function isNodeJSLike() {
    return isNodeJS() || isBun() || isDeno();
}

/**
 * 是否处于 {@link PlatformSpec.WinterTC} 平台
 */
export function isWinterTC() {
    return isNodeJS() || isBun() || isDeno() || isBrowser();
}

/**
 * 是否处于 {@link PlatformSpec.W3C} 平台
 */
export function isW3C() {
    return isBrowser();
}

// 平台

/**
 * 是否处于 {@link Platform.Wechat} 平台
 */
export function isWechat() {
    if (COCOS) {
        return ccenv.WECHAT;
    }

    if (NODE) {
        return false;
    }

    // 如果是微信小游戏平台应该存在 wx 对象
    return typeof wx !== "undefined";
}

/**
 * 是否处于 {@link Platform.Browser} 平台
 */
export function isBrowser() {
    if (COCOS) {
        return ccenv.HTML5;
    }

    if (NODE) {
        return false;
    }

    // 如果是浏览器应该能访问 window.navigator.userAgent
    try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- checked.
        return window.navigator.userAgent != null;
    } catch (error) {
        return false;
    }
}

/**
 * 是否处于 {@link Platform.Bun} 平台
 */
export function isBun() {
    if (COCOS) {
        return false;
    }

    // 兼容 NodeJS 的平台应该存在 process 对象
    const isNodelike = typeof process !== "undefined";

    // https://bun.sh/guides/util/detect-bun
    return isNodelike && process.versions.bun != null;
}

/**
 * 是否处于 {@link Platform.Deno} 平台
 */
export function isDeno() {
    if (COCOS) {
        return false;
    }

    // 兼容 NodeJS 的平台应该存在 process 对象
    const isNodelike = typeof process !== "undefined";

    // @ts-expect-error -- checked.
    return isNodelike && globalThis.Deno != null;
}

/**
 * 是否处于 {@link Platform.NodeJS} 平台
 */
export function isNodeJS() {
    if (COCOS) {
        return false;
    }

    // 兼容 NodeJS 的平台应该存在 process 对象
    const isNodelike = typeof process !== "undefined";

    return isNodelike && !isBun();
}

// 系统

/**
 * 是否处于 {@link System.Android} 系统
 */
export function isAndroid() {
    if (COCOS) {
        return ccenv.ANDROID;
    }

    if (NODE) {
        return node_os.platform() === "android";
    }

    return false;
}

/**
 * 是否处于 {@link System.IOS} 系统
 */
export function isIOS() {
    if (COCOS) {
        return ccenv.IOS;
    }

    return false;
}

/**
 * 是否处于 {@link System.Windows} 系统
 */
export function isWindows() {
    if (COCOS) {
        return ccenv.WINDOWS;
    }

    if (NODE) {
        return node_os.platform() === "win32";
    }

    return false;
}

/**
 * 是否处于 {@link System.Mac} 系统
 */
export function isMac() {
    if (COCOS) {
        return ccenv.MAC;
    }

    if (NODE) {
        return node_os.platform() === "darwin";
    }

    return false;
}

/**
 * 是否处于 {@link System.Linux} 系统
 */
export function isLinux() {
    if (COCOS) {
        return ccenv.LINUX;
    }

    if (NODE) {
        return node_os.platform() === "linux";
    }

    return false;
}

/**
 * 是否处于 {@link System.HarmonyOS} 系统
 */
export function isHarmonyOS() {
    if (COCOS) {
        return ccenv.OHOS;
    }

    return false;
}

/**
 * 是否处于 {@link System.OpenHarmony} 系统
 */
export function isOpenHarmony() {
    if (COCOS) {
        return ccenv.OPEN_HARMONY;
    }

    return false;
}

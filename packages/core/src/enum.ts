/**
 * 平台枚举
 *
 * 键值参考 [W3C Runtime Keys](https://runtime-keys.proposal.wintercg.org/)
 */
export enum Platform {
    /**
     * 未知平台
     */
    Unknown = "unknown",

    /**
     * 浏览器
     */
    Browser = "browser",

    /**
     * 微信小程序/小游戏
     */
    Wechat = "wechat",

    /**
     * Node.js
     */
    NodeJS = "node",

    /**
     * Bun
     */
    Bun = "bun",

    /**
     * Deno
     */
    Deno = "deno",
}

/**
 * 系统枚举
 */
export enum System {
    /**
     * 未知
     */
    Unknown = "unknown",

    /**
     * IOS / IPadOS
     */
    IOS = "ios",

    /**
     * Android
     */
    Android = "android",

    /**
     * Windows
     */
    Windows = "windows",

    /**
     * Linux
     */
    Linux = "linux",

    /**
     * Mac
     */
    Mac = "macos",

    /**
     * 鸿蒙系统
     */
    HarmonyOS = "harmonyos",

    /**
     * 开放鸿蒙
     */
    OpenHarmony = "openharmony",
}

/**
 * 平台规格
 */
export enum PlatformSpec {
    /**
     * 符合 [WinterTC](https://wintertc.org/) 规范的运行时
     */
    WinterTC = "wintertc",

    /**
     * 兼容 [NodeJS](https://nodejs.org/) 的运行时
     */
    NodeJSLike = "nodejslike",

    /**
     * 符合 [W3C](https://www.w3.org/) 规范的运行时
     */
    W3C = "w3c",
}

/**
 * 脚本引擎枚举
 */
export enum ScriptEngine {
    /**
     * 未知
     */
    Unknown = "unknown",

    /**
     * Google V8
     */
    V8 = "v8",

    /**
     * Apple JavaScriptCore
     */
    JavaScriptCore = "javascriptcore",

    /**
     * Mozilla SpiderMonkey
     */
    SpiderMonkey = "spidermonkey",

    /**
     * Fabrice Bellard QuickJS
     */
    QuickJS = "quickjs",
}

/**
 * 平台枚举
 */
export enum Platform {
    /**
     * 未知平台
     */
    Unknown = "Unknown",

    /**
     * 浏览器
     */
    Browser = "Browser",

    /**
     * 微信小程序/小游戏
     */
    Wechat = "Wechat",

    /**
     * Node.js
     */
    NodeJS = "NodeJS",

    /**
     * Bun
     */
    Bun = "Bun",
}

/**
 * 系统枚举
 */
export enum System {
    /**
     * 未知
     */
    Unknown = "Unknown",

    /**
     * IOS / IPadOS
     */
    IOS = "iOS",

    /**
     * Android
     */
    Android = "Android",

    /**
     * Windows
     */
    Windows = "Windows",

    /**
     * Linux
     */
    Linux = "Linux",

    /**
     * Mac
     */
    Mac = "MacOS",

    /**
     * 鸿蒙系统
     */
    HarmonyOS = "HarmonyOS",

    /**
     * 开放鸿蒙
     */
    OpenHarmony = "OpenHarmony",
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
    NodeJSLike = "nodejs-like",

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
    Unknown = "Unknown",

    /**
     * Google V8
     */
    V8 = "V8",

    /**
     * Apple JavaScriptCore
     */
    JavaScriptCore = "JavaScriptCore",

    /**
     * Mozilla SpiderMonkey
     */
    SpiderMonkey = "SpiderMonkey",

    /**
     * Fabrice Bellard QuickJS
     */
    QuickJS = "QuickJS",
}

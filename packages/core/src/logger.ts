import { ENV_NAME } from "./env.js";

/**
 * 内部日志记录器接口
 *
 * 默认为 {@link console}
 */
export interface InternalLogger {
    trace(...msgs: any[]): void;
    debug(...msgs: any[]): void;
    info(...msgs: any[]): void;
    warn(...msgs: any[]): void;
    error(...msgs: any[]): void;
}

/**
 * 内部日志记录器
 */
export const log: InternalLogger = console;

/**
 * 创建 `pal` 插件专用的日志记录器
 */
export function createPalLogger(pluginId: string) {
    return {
        notSupport(prop: string) {
            log.error(
                `current environment ${ENV_NAME} does not support ${pluginId}.${prop}.`,
            );
        },
        notSupportMessage(prop: string, message: string) {
            log.error(
                `current environment ${ENV_NAME}'s ${pluginId}.${prop} ${message}.`,
            );
        },
    };
}

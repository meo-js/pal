import { ENV_NAME } from './env.js';

/**
 * 内部日志记录器接口
 *
 * 默认为 {@link console}
 *
 * @internal
 */
export interface InternalLogger {
  trace(...msgs: unknown[]): void;
  debug(...msgs: unknown[]): void;
  info(...msgs: unknown[]): void;
  warn(...msgs: unknown[]): void;
  error(...msgs: unknown[]): void;
}

/**
 * 内部日志记录器
 *
 * @internal
 */
export const log: InternalLogger = console;

/**
 * 创建 `pal` 插件通用的日志记录器
 */
export function createLogger(pluginId: string) {
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

import { Encoding, type StringEncoding } from "@meojs/fs-constants";
import { createLogger, isNodeJSLike } from "@meojs/pal";
import type { PathBuffer, PathLike } from "@meojs/path-constants";
import { isUint8Array } from "@meojs/std/predicate";

const log = createLogger("process");

let _currentDir: string = "/";

/**
 * 返回当前工作目录
 */
export function getCurrentDir(encoding?: StringEncoding): string;
export function getCurrentDir(encoding: Encoding.Binary): PathBuffer;
export function getCurrentDir(encoding?: Encoding): PathLike;
export function getCurrentDir(encoding: Encoding = Encoding.Utf8): PathLike {
    if (encoding !== Encoding.Utf8) {
        log.notSupportMessage(
            "currentDir",
            `only support utf8 encoding, but got ${encoding}.`,
        );
    }

    if (isNodeJSLike()) {
        return process.cwd();
    } else {
        return _currentDir;
    }
}

/**
 * 设置当前工作目录
 */
export function setCurrentDir(
    path: string | PathBuffer,
    encoding: Encoding = Encoding.Utf8,
) {
    if (isUint8Array(path)) {
        log.notSupportMessage(
            "setCurrentDir",
            `only support string path, but got PathBuffer.`,
        );
        return;
    }

    if (encoding !== Encoding.Utf8) {
        log.notSupportMessage(
            "setCurrentDir",
            `only support utf8 encoding, but got ${encoding}.`,
        );
    }

    if (isNodeJSLike()) {
        process.chdir(path);
    } else {
        _currentDir = path;
    }
}

// TODO safePath/safeName utils
// TODO 看下 https://doc.rust-lang.org/std/path/struct.Path.html 都有些啥工具函数

import { isNodeJSLike } from "@meojs/pal";
import { getCurrentDir } from "@meojs/process";
import * as node_path from "path";
import { isAbsolute, normalizeString } from "pathe";

/**
 * 平台特定的路径分隔符
 *
 * @example Windows
 * `;`
 * @example POSIX
 * `:`
 */
export const delimiter: ";" | ":" = isNodeJSLike() ? node_path.delimiter : ":";

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//u;

function normalizeWindowsPath(input = "") {
    if (!input) {
        return input;
    }
    return input
        .replace(/\\/gu, "/")
        .replace(_DRIVE_LETTER_START_RE, r => r.toUpperCase());
}

// 由于需要使用 getCurrentDir 来获取当前目录，所以这是从 pathe 拷贝的 resolve 的实现
export const resolve: typeof node_path.resolve = function (...arguments_) {
    // Normalize windows arguments
    arguments_ = arguments_.map(argument => normalizeWindowsPath(argument));

    let resolvedPath = "";
    let resolvedAbsolute = false;

    for (
        let index = arguments_.length - 1;
        index >= -1 && !resolvedAbsolute;
        index--
    ) {
        const path = index >= 0 ? arguments_[index] : getCurrentDir();

        // Skip empty entries
        if (!path || path.length === 0) {
            continue;
        }

        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = isAbsolute(path);
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
        return `/${resolvedPath}`;
    }

    return resolvedPath.length > 0 ? resolvedPath : ".";
};

export * from "@meojs/path-constants";
export {
    basename,
    dirname,
    extname,
    format,
    isAbsolute,
    join,
    normalize,
    parse,
    relative,
    sep,
} from "pathe";
export { filename } from "pathe/utils";

import { isString } from "@meojs/utils";
import { dirname } from "@meojs/utils/path";
import { mkdir, readdir } from "./impls/nodejs/fs.js";
import { remove } from "./operate.js";
import { Encoding, type Mode, type Uint8String } from "./shared.js";
import { hasAccess, type Dirent } from "./stat.js";

/**
 * 目录创建选项
 */
export interface MakeDirOptions {
    /**
     * 权限模式
     *
     * @default 0o777
     */
    mode?: Mode;
}

/**
 * 目录创建选项
 */
export interface ReadDirOptions {
    /**
     * 指定返回文件路径的编码格式
     *
     * 所有数据编码均为小端序。
     *
     * @default Encoding.Utf8
     */
    encoding?: Encoding;

    /**
     * 返回目录项对象而不是路径字符串
     *
     * @default false
     */
    withDirent?: boolean;
}

/**
 * 创建目录
 *
 * @param path 目录路径
 * @param opts {@link MakeDirOptions}
 */
export async function makeDir(
    path: string | Uint8String,
    opts?: MakeDirOptions | Mode,
): Promise<void> {
    await mkdir(path, opts);
}

/**
 * 创建传入路径的父目录
 *
 * @param path 路径
 * @param opts {@link MakeDirOptions}
 */
export async function makeParentDir(
    path: string | Uint8String,
    opts?: MakeDirOptions | Mode,
): Promise<void> {
    if (isString(path)) {
        await mkdir(dirname(path), opts);
    } else {
        // 传入二进制路径的话无法处理路径，只能先判断是否有东西存在，没有则创建一个目录然后再删除，这样确保父目录会被创建
        try {
            if (!(await hasAccess(path))) {
                await mkdir(path, opts);
                await remove(path);
            }
        } catch (error) {
            // ignore any error.
        }
    }
}

/**
 * 读取目录内容
 *
 * 当 {@link ReadDirOptions.withDirent opts.withDirent} 设置为 `true` 时不支持将 {@link ReadDirOptions.encoding opts.encoding} 设置为 {@link Encoding.Binary}，依然会返回 {@link Encoding.Utf8} 编码的字符串。
 *
 * @param path 目录路径
 * @param opts 提供 {@link ReadDirOptions} 完整选项或仅指定文件名的 {@link Encoding} 编码格式
 * @returns 默认返回文件名数组，如 `example.txt`，若{@link ReadDirOptions.encoding opts.encoding} 设置为 {@link Encoding.Binary} 则返回文件名二进制数据数组，若 {@link ReadDirOptions.withDirent withDirent} 为 `true`，则返回目录项对象 {@link Dirent} 数组。
 */
export async function readDir(
    path: string | Uint8String,
    opts: ReadDirOptions & { withDirent: true },
): Promise<Dirent[]>;
export async function readDir(
    path: string | Uint8String,
    opts:
        | (ReadDirOptions & { withDirent?: false; encoding: Encoding.Binary })
        | Encoding.Binary,
): Promise<Uint8Array[]>;
export async function readDir(
    path: string | Uint8String,
    opts?:
        | (ReadDirOptions & {
              withDirent?: false;
              encoding?: Exclude<Encoding, Encoding.Binary>;
          })
        | Exclude<Encoding, Encoding.Binary>,
): Promise<string[]>;
export async function readDir(
    path: string | Uint8String,
    opts?:
        | (ReadDirOptions & {
              withDirent?: false;
          })
        | Encoding,
): Promise<string[] | Uint8Array[]>;
export async function readDir(
    path: string | Uint8String,
    opts:
        | (ReadDirOptions & {
              withDirent?: boolean;
              encoding?: Exclude<Encoding, Encoding.Binary>;
          })
        | Exclude<Encoding, Encoding.Binary>,
): Promise<string[] | Dirent[]>;
export async function readDir(
    path: string | Uint8String,
    opts?:
        | (ReadDirOptions & {
              withDirent?: boolean;
              encoding: Encoding.Binary;
          })
        | Encoding.Binary,
): Promise<Uint8Array[] | Dirent[]>;
export async function readDir(
    path: string | Uint8String,
    opts?: ReadDirOptions | Encoding,
): Promise<string[] | Uint8Array[] | Dirent[]>;
export async function readDir(
    path: string | Uint8String,
    opts?: ReadDirOptions | Encoding,
): Promise<string[] | Uint8Array[] | Dirent[]> {
    return await readdir(path, opts);
}

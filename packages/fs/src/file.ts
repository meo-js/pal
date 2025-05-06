import type { StringEncoding } from "@meojs/fs-constants";
import type { PathLike } from "@meojs/path";
import { isFunction, isObject } from "@meojs/std/predicate";
import type { PromisableLike } from "@meojs/std/promise";
import type { uncertain } from "@meojs/std/ts";
import { makeParentDir } from "./dir.js";
import {
    appendFile,
    isNodeJSError,
    readFile,
    truncateFile,
    writeFile,
} from "./impls/nodejs/fs.js";
import { Encoding, type Mode } from "./shared.js";

/**
 * 文件数据修改函数
 */
export type FileDataModifier<T extends FileData = uncertain> = (
    data: T | undefined,
) => PromisableLike<FileData>;

/**
 * 文件数据支持类型
 */
export type FileData = string | BufferSource;

/**
 * 文件写入选项
 */
export interface WriteFileOptions {
    /**
     * 当传入 `string` 类型数据时指定编码格式
     *
     * @default Encoding.Utf8
     */
    encoding?: StringEncoding;

    /**
     * 权限
     *
     * @default 0o666
     */
    mode?: Mode;

    /**
     * 用于中止操作的信号对象
     */
    signal?: AbortSignal;
}

/**
 * 文件修改选项
 */
export interface ModifyFileOptions {
    /**
     * 指定编码格式
     *
     * @default Encoding.Binary
     */
    encoding?: Encoding;

    /**
     * 当 {@link FileDataModifier} 返回 `string` 类型数据时指定编码格式
     *
     * 仅当 {@link encoding} 为 {@link Encoding.Binary} 时该选项有效，否则使用 {@link encoding} 的值。
     *
     * @default Encoding.Utf8
     */
    writeEncoding?: StringEncoding;

    /**
     * 权限
     *
     * @default 0o666
     */
    mode?: Mode;

    /**
     * 用于中止操作的信号对象
     */
    signal?: AbortSignal;
}

/**
 * 文件读取选项
 */
export interface ReadFileOptions {
    /**
     * 指定编码格式
     *
     * @default Encoding.Binary
     */
    encoding?: Encoding;

    /**
     * 用于中止操作的信号对象
     */
    signal?: AbortSignal;
}

/**
 * 向文件写入数据
 */
export async function write(
    path: PathLike,
    data: FileData,
    opts?: WriteFileOptions | StringEncoding,
): Promise<void>;
export async function write(
    path: PathLike,
    data: FileDataModifier<Uint8Array>,
    opts?:
        | (ModifyFileOptions & { encoding?: Encoding.Binary })
        | Encoding.Binary,
): Promise<void>;
export async function write(
    path: PathLike,
    data: FileDataModifier<string>,
    opts?: (ModifyFileOptions & { encoding: StringEncoding }) | StringEncoding,
): Promise<void>;
export async function write(
    path: PathLike,
    data: FileDataModifier,
    opts?: ModifyFileOptions | Encoding,
): Promise<void>;
export async function write(
    path: PathLike,
    data: FileData | FileDataModifier,
    opts?: WriteFileOptions | ModifyFileOptions | Encoding,
): Promise<void> {
    await makeParentDir(path);

    if (isFunction(data)) {
        // 修改器默认编码为 Binary
        if (isObject(opts)) {
            if (opts.encoding == null) {
                opts.encoding = Encoding.Binary;
            }
        } else if (opts == null) {
            opts = Encoding.Binary;
        }

        let _data: FileData | undefined = undefined;
        try {
            _data = await readFile(path, opts);
        } catch (error) {
            if (!isNodeJSError(error) || error.code !== "ENOENT") {
                throw error;
            }
        }
        await writeFile(path, await data(_data), opts);
    } else {
        await writeFile(path, data, opts);
    }
}

/**
 * 读取文件数据
 */
export async function read(
    path: PathLike,
    opts?: (ReadFileOptions & { encoding?: Encoding.Binary }) | Encoding.Binary,
): Promise<Uint8Array>;
export async function read(
    path: PathLike,
    opts: (ReadFileOptions & { encoding: StringEncoding }) | StringEncoding,
): Promise<string>;
export async function read(
    path: PathLike,
    opts?: ReadFileOptions | Encoding,
): Promise<Uint8Array | string>;
export async function read(
    path: PathLike,
    opts?: ReadFileOptions | Encoding,
): Promise<Uint8Array | string> {
    return await readFile(path, opts);
}

/**
 * 向文件末尾追加数据
 */
export async function append(
    path: PathLike,
    data: FileData,
    opts?: WriteFileOptions | StringEncoding,
): Promise<void> {
    await makeParentDir(path);
    await appendFile(path, data, opts);
}

/**
 * 将文件内容截断（延长或缩短长度）为 {@link len} 字节
 */
export async function truncate(path: PathLike, len: number = 0) {
    await truncateFile(path, len);
}

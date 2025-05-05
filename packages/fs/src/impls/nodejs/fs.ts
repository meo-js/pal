/**
 * @module
 *
 * @internal
 */
import type { PathBuffer, PathLike } from "@meojs/path";
import {
    isArray,
    isArrayBuffer,
    isArrayBufferView,
    isBigInt,
    isNumber,
    isObject,
    isString,
    isUint8Array,
} from "@meojs/std/guard";
import type { uncertain } from "@meojs/std/ts";
import {
    constants,
    Dirent as Dirent_Impl,
    Stats as Stats_Impl,
    type BigIntStats as BigIntStats_Impl,
    type MakeDirectoryOptions,
    type Mode as Mode_Impl,
    type PathLike as PathLike_Impl,
} from "fs";
import fs from "fs/promises";
import type { MakeDirOptions, ReadDirOptions } from "../../dir.js";
import type {
    FileData,
    ModifyFileOptions,
    ReadFileOptions,
    WriteFileOptions,
} from "../../file.js";
import { Access, e, Encoding, Mode } from "../../shared.js";
import { BigIntStat, Dirent, Stat } from "./stat.js";

export function impl2Mode(impl: Extract<Mode_Impl, number>): Mode {
    let mode: Mode = 0;

    // 用户权限
    if (impl & constants.S_IRUSR) mode |= Mode.Owner_R;
    if (impl & constants.S_IWUSR) mode |= Mode.Owner_W;
    if (impl & constants.S_IXUSR) mode |= Mode.Owner_X;

    // 组权限
    if (impl & constants.S_IRGRP) mode |= Mode.Group_R;
    if (impl & constants.S_IWGRP) mode |= Mode.Group_W;
    if (impl & constants.S_IXGRP) mode |= Mode.Group_X;

    // 其他用户权限
    if (impl & constants.S_IROTH) mode |= Mode.Other_R;
    if (impl & constants.S_IWOTH) mode |= Mode.Other_W;
    if (impl & constants.S_IXOTH) mode |= Mode.Other_X;

    return mode;
}

export function mode2Impl(mode: Mode): Extract<Mode_Impl, number> {
    let impl: Mode_Impl = 0;

    if (mode & Mode.Owner_R) impl |= constants.S_IRUSR;
    if (mode & Mode.Owner_W) impl |= constants.S_IWUSR;
    if (mode & Mode.Owner_X) impl |= constants.S_IXUSR;

    if (mode & Mode.Group_R) impl |= constants.S_IRGRP;
    if (mode & Mode.Group_W) impl |= constants.S_IWGRP;
    if (mode & Mode.Group_X) impl |= constants.S_IXGRP;

    if (mode & Mode.Other_R) impl |= constants.S_IROTH;
    if (mode & Mode.Other_W) impl |= constants.S_IWOTH;
    if (mode & Mode.Other_X) impl |= constants.S_IXOTH;

    return impl;
}

export function impl2Access(impl: number): Access {
    let access = 0;
    if (impl & constants.F_OK) access |= Access.Visible;
    if (impl & constants.R_OK) access |= Access.Read;
    if (impl & constants.W_OK) access |= Access.Write;
    if (impl & constants.X_OK) access |= Access.Execute;
    return access;
}

export function access2Impl(access: Access): number {
    let impl = 0;
    if (access & Access.Visible) impl |= constants.F_OK;
    if (access & Access.Read) impl |= constants.R_OK;
    if (access & Access.Write) impl |= constants.W_OK;
    if (access & Access.Execute) impl |= constants.X_OK;
    return impl;
}

export function impl2Encoding(impl: BufferEncoding | "buffer"): Encoding {
    switch (impl) {
        case "utf8":
        case "utf-8":
            return Encoding.Utf8;
        case "utf16le":
        case "utf-16le":
        case "ucs2":
        case "ucs-2":
            return Encoding.Utf16le;
        case "base64":
            return Encoding.Base64;
        case "base64url":
            return Encoding.Base64url;
        case "latin1":
        case "ascii":
        case "binary":
            return Encoding.Latin1;
        case "hex":
            return Encoding.Hex;
        case "buffer":
            return Encoding.Binary;
    }
}

export function encoding2Impl(encoding: Encoding): BufferEncoding | "buffer" {
    switch (encoding) {
        case Encoding.Utf8:
            return "utf8";
        case Encoding.Utf16le:
            return "utf16le";
        case Encoding.Utf16be:
            // TODO
            return "utf16be" as never;
        case Encoding.Base64:
            return "base64";
        case Encoding.Base64url:
            return "base64url";
        case Encoding.Latin1:
            return "latin1";
        case Encoding.Hex:
            return "hex";
        case Encoding.Binary:
            return "buffer";
    }
}

export function buffer2Uint8Array(buffer: Buffer): Uint8Array {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

export function uint8Array2Buffer(uint8Array: Uint8Array): Buffer {
    return Buffer.from(
        uint8Array.buffer,
        uint8Array.byteOffset,
        uint8Array.byteLength,
    );
}

export function fileData2Impl(data: FileData): string | Uint8Array {
    if (isArrayBuffer(data)) {
        return new Uint8Array(data);
    }
    if (isArrayBufferView(data) && !isUint8Array(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }

    return data;
}

export function isNodeJSError(error: unknown): error is NodeJS.ErrnoException {
    return (
        typeof error === "object"
        && error != null
        && "code" in error
        && typeof error.code === "string"
    );
}

export function impl2Error(impl: unknown) {
    if (isNodeJSError(impl)) {
        switch (impl.code) {
            case "ENOENT":
                return e.NotExist(impl.message, { cause: impl });

            case "EPERM":
                return e.NoPermission(impl.message, { cause: impl });

            case "EMFILE":
                return e.TooManyOpen(impl.message, { cause: impl });

            default:
                return e.InternalError(impl.message, { cause: impl });
        }
    }
    return impl;
}

export function path2impl(path: PathLike): PathLike_Impl {
    return isString(path) ? path : uint8Array2Buffer(path);
}

export function impl2stats(impl: Stats_Impl | BigIntStats_Impl) {
    if (isBigInt(impl.mode)) {
        return new BigIntStat(impl as BigIntStats_Impl);
    } else {
        return new Stat(impl as Stats_Impl);
    }
}

export function mkdirOptions2impl(
    opts?: MakeDirOptions | Mode,
): Mode_Impl | MakeDirectoryOptions | null | undefined {
    let mode: Mode_Impl;
    if (opts != null) {
        if (isNumber(opts)) {
            mode = mode2Impl(opts);
        } else {
            mode = mode2Impl(opts.mode ?? (0o777 as Mode));
        }
    } else {
        mode = 0o777;
    }
    return {
        recursive: true,
        mode,
    };
}

export function readdirOptions2impl(
    opts?: ReadDirOptions | Encoding,
): Parameters<typeof fs.readdir>[1] {
    const withFileTypes = isObject(opts) ? opts.withDirent : undefined;
    let encoding = encoding2Impl(
        (isObject(opts) ? opts.encoding : opts) ?? Encoding.Utf8,
    );

    if (withFileTypes != null) {
        // withDirent 暂不支持 Buffer 编码
        if (withFileTypes && encoding === "buffer") {
            encoding = "utf8";
        }
        return { withFileTypes, encoding } as never;
    } else {
        return encoding as never;
    }
}

export function writeFileOptions2impl(
    opts?: WriteFileOptions | ModifyFileOptions | Encoding,
): Parameters<typeof fs.writeFile>[2] {
    const encoding = encoding2Impl(
        (isObject(opts) ? opts.encoding : opts) ?? Encoding.Utf8,
    );
    const mode = mode2Impl(
        (isObject(opts) ? opts.mode : undefined) ?? (0o666 as Mode),
    );
    const signal = isObject(opts) ? opts.signal : undefined;

    if (encoding === "buffer") {
        const writeEncoding = encoding2Impl(
            (isObject(opts)
                ? (<ModifyFileOptions>opts).writeEncoding
                : undefined) ?? Encoding.Utf8,
        ) as BufferEncoding;
        return {
            encoding: writeEncoding,
            mode,
            signal,
        };
    } else {
        return {
            encoding,
            mode,
            signal,
        };
    }
}

export function readFileOptions2impl(
    opts?: ReadFileOptions | Encoding,
): Parameters<typeof fs.readFile>[1] {
    const encoding = encoding2Impl(
        (isObject(opts) ? opts.encoding : opts) ?? Encoding.Binary,
    );
    const signal = isObject(opts) ? opts.signal : undefined;

    return {
        // 传入 Binary 等同于 NodeJS 传入 undefined
        encoding: encoding === "buffer" ? undefined : encoding,
        signal,
    };
}

export function statOptions2impl(
    bigint: boolean,
): Parameters<typeof fs.stat>[1] {
    return {
        bigint,
    };
}

export function impl2Return<
    T extends Dirent_Impl[] | string[] | Buffer[] | Buffer | string,
    R,
>(v: T): R {
    if (isArray(v)) {
        const first = v[0];
        if (isString(first)) {
            // do nothing.
        } else if (first instanceof Buffer) {
            for (let i = 0; i < v.length; i++) {
                (<Uint8Array[]>v)[i] = buffer2Uint8Array((<Buffer[]>v)[i]);
            }
        } else {
            for (let i = 0; i < v.length; i++) {
                const dirent = (<Dirent_Impl[]>v)[i];
                (<Dirent[]>(<unknown>v))[i] = new Dirent(dirent);
            }
        }
        return v as unknown as R;
    } else {
        if (isString(v)) {
            // do nothing.
        } else {
            return buffer2Uint8Array(v) as unknown as R;
        }
        return v as unknown as R;
    }
}

function nothing<T>(v: T): T {
    return v;
}

export function wrap<T extends Function>(fn: T): T {
    return async function callImpl(...args: unknown[]) {
        try {
            // eslint-disable-next-line prefer-spread -- checked.
            await fn.apply(undefined, args);
        } catch (error) {
            throw impl2Error(error);
        }
    } as unknown as T;
}

export function wrap2<T extends (...args: uncertain) => unknown, P1, P2, R>(
    fn: T,
    arg1: (v: P1) => Parameters<T>[0],
    arg2: (v: P2) => Parameters<T>[1],
    r: (v: Awaited<ReturnType<T>>) => R,
): (arg1: P1, arg2: P2) => Promise<R> {
    return async function callImpl(_1: P1, _2: P2) {
        try {
            return r((await fn(arg1(_1), arg2(_2))) as Awaited<ReturnType<T>>);
        } catch (error) {
            throw impl2Error(error);
        }
    };
}

export function wrap3<T extends (...args: uncertain) => unknown, P1, P2, P3, R>(
    fn: T,
    arg1: (v: P1) => Parameters<T>[0],
    arg2: (v: P2) => Parameters<T>[1],
    arg3: (v: P3) => Parameters<T>[2],
    r: (v: Awaited<ReturnType<T>>) => R,
): (arg1: P1, arg2: P2, arg3: P3) => Promise<R> {
    return async function callImpl(_1: P1, _2: P2, _3: P3) {
        try {
            return r(
                (await fn(arg1(_1), arg2(_2), arg3(_3))) as Awaited<
                    ReturnType<T>
                >,
            );
        } catch (error) {
            throw impl2Error(error);
        }
    };
}

export const mkdir = wrap2(fs.mkdir, path2impl, mkdirOptions2impl, nothing);

export const readFile = wrap2(
    fs.readFile,
    path2impl,
    readFileOptions2impl,
    impl2Return<Awaited<ReturnType<typeof fs.readFile>>, string | Uint8Array>,
);

export const writeFile = wrap3(
    fs.writeFile,
    path2impl,
    fileData2Impl,
    writeFileOptions2impl,
    nothing,
);

export const readdir = wrap2(
    fs.readdir,
    path2impl,
    readdirOptions2impl,
    impl2Return<
        Awaited<ReturnType<typeof fs.readdir>>,
        Dirent[] | string[] | PathBuffer[]
    >,
);

export const appendFile = wrap3(
    fs.appendFile,
    path2impl,
    fileData2Impl,
    writeFileOptions2impl,
    nothing,
);

export const truncateFile = wrap2(
    fs.truncate,
    path2impl,
    nothing<Parameters<typeof fs.truncate>[1]>,
    nothing,
);

export const access = wrap2(fs.access, path2impl, access2Impl, nothing);

export const rm = wrap2(
    fs.rm,
    path2impl,
    nothing<Parameters<typeof fs.rm>[1]>,
    nothing,
);

export const stat = wrap2(fs.stat, path2impl, statOptions2impl, impl2stats);

export const lstat = wrap2(fs.lstat, path2impl, statOptions2impl, impl2stats);

export const chmod = wrap2(fs.chmod, path2impl, mode2Impl, nothing);

export const lchmod = wrap2(
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- checked.
    fs.lchmod,
    path2impl,
    mode2Impl,
    nothing,
);

export const chown = wrap3(
    fs.chown,
    path2impl,
    nothing<Parameters<typeof fs.chown>[1]>,
    nothing<Parameters<typeof fs.chown>[2]>,
    nothing,
);

export const lchown = wrap3(
    fs.lchown,
    path2impl,
    nothing<Parameters<typeof fs.lchown>[1]>,
    nothing<Parameters<typeof fs.lchown>[2]>,
    nothing,
);

export const utimes = wrap3(
    fs.utimes,
    path2impl,
    nothing<Parameters<typeof fs.utimes>[1]>,
    nothing<Parameters<typeof fs.utimes>[2]>,
    nothing,
);

export const lutimes = wrap3(
    fs.lutimes,
    path2impl,
    nothing<Parameters<typeof fs.lutimes>[1]>,
    nothing<Parameters<typeof fs.lutimes>[2]>,
    nothing,
);

import type { PathLike } from "@meojs/path";
import type { OmitKey, PickKey } from "@meojs/std/object";
import { isBigInt } from "@meojs/std/predicate";
import { readDir } from "./dir.js";
import {
    access as access_impl,
    chmod,
    chown,
    lchmod,
    lchown,
    lstat,
    lutimes,
    stat,
    utimes,
} from "./impls/nodejs/fs.js";
import { Access, type Mode, type Type } from "./shared.js";

/**
 * 目录条目信息
 */
export interface Dirent {
    /**
     * 类型
     */
    get type(): Type;

    /**
     * 绝对路径
     *
     * @example `/home/user/example.txt`
     */
    get path(): string;

    /**
     * @returns 目录项是否为块设备
     */
    isBlockDevice(): boolean;

    /**
     * @returns 目录项是否为字符设备
     */
    isCharacterDevice(): boolean;

    /**
     * @returns 目录项是否为目录
     */
    isDirectory(): boolean;

    /**
     * @returns 目录项是否为 FIFO 管道
     */
    isFIFO(): boolean;

    /**
     * @returns 目录项是否为文件
     */
    isFile(): boolean;

    /**
     * @returns 目录项是否为套接字
     */
    isSocket(): boolean;

    /**
     * @returns 目录项是否为符号链接
     */
    isSymbolicLink(): boolean;
}

/**
 * 文件信息
 */
export interface Stat extends OmitKey<Dirent, "path"> {
    /**
     * 文件所属用户 ID
     */
    userId: number;

    /**
     * 文件所属组 ID
     */
    groupId: number;

    /**
     * 权限
     */
    get mode(): Mode;

    /**
     * 文件大小（字节）
     */
    get size(): number;

    /**
     * 上次访问文件数据的时间戳（毫秒）
     *
     * 在 Unix 系统中，由 mknod(2)、utimes(2)、read(2) 系统调用更新。
     */
    get accessTime(): number;

    /**
     * 文件数据最后修改的时间戳（毫秒）
     *
     * 在 Unix 系统中，由 mknod(2)、utimes(2)、write(2) 系统调用更新。
     */
    get modifyTime(): number;

    /**
     * 文件状态最后修改的时间戳（毫秒）
     *
     * 在 Unix 系统中，由 chmod(2)、chown(2)、link(2)、mknod(2)、rename(2)、unlink(2)、utimes(2)、read(2)、write(2) 系统调用更新。
     */
    get changeTime(): number;

    /**
     * 文件创建时的时间戳（毫秒）
     *
     * 在某些系统中，该时间戳不一定早于其他时间戳。
     */
    get birthTime(): number;
}

/**
 * 文件信息
 *
 * 使用 {@link BigInt} 存储文件大小和时间戳。
 */
export interface BigIntStat extends OmitKey<Dirent, "path"> {
    /**
     * 所属用户 ID
     */
    userId: bigint;

    /**
     * 所属组 ID
     */
    groupId: bigint;

    /**
     * 权限
     */
    get mode(): Mode;

    /**
     * 文件大小（字节）
     */
    get size(): bigint;

    /**
     * 上次访问文件数据的时间戳（纳秒）
     *
     * 在 Unix 系统中，由 mknod(2)、utimes(2)、read(2) 系统调用更新。
     */
    get accessTime(): bigint;

    /**
     * 文件数据最后修改的时间戳（纳秒）
     *
     * 在 Unix 系统中，由 mknod(2)、utimes(2)、write(2) 系统调用更新。
     */
    get modifyTime(): bigint;

    /**
     * 文件状态最后修改的时间戳（纳秒）
     *
     * 在 Unix 系统中，由 chmod(2)、chown(2)、link(2)、mknod(2)、rename(2)、unlink(2)、utimes(2)、read(2)、write(2) 系统调用更新。
     */
    get changeTime(): bigint;

    /**
     * 文件创建时的时间戳（纳秒）
     *
     * 在某些系统中，该时间戳不一定早于其他时间戳。
     */
    get birthTime(): bigint;
}

/**
 * 获取文件信息选项
 */
export interface GetStatsOptions {
    /**
     * 以 {@link BigInt} 格式返回数值。
     *
     * @default false
     */
    bigint?: boolean;

    /**
     * 如果路径是符号链接，则返回符号链接本身的信息，而不是它所指向的文件的信息。
     *
     * @default false
     */
    preserveSymlinks?: boolean;
}

/**
 * 设置文件信息选项
 */
export interface SetStatsOptions {
    /**
     * 修改文件的访问权限
     */
    mode?: Mode;

    /**
     * 修改文件的拥有者
     */
    owner?: {
        /**
         * 修改文件的所属用户
         */
        userId: number | bigint;

        /**
         * 修改文件的所属组
         */
        groupId: number | bigint;
    };

    /**
     * 修改文件的时间戳
     */
    time?: {
        /**
         * 修改上次访问文件数据的时间戳（传入 `number` 则视为毫秒，传入 `bigint` 则视为纳秒）
         */
        accessTime: number | bigint;

        /**
         * 修改文件数据最后修改的时间戳（传入 `number` 则视为毫秒，传入 `bigint` 则视为纳秒）
         */
        modifyTime: number | bigint;
    };

    /**
     * 如果路径是符号链接，则修改符号链接本身的信息，而不是它所指向的文件的信息。
     *
     * @default false
     */
    preserveSymlinks?: boolean;
}

/**
 * 测试是否对指定路径有访问权限
 */
export async function hasAccess(
    path: PathLike,
    access: Access = Access.Visible,
) {
    try {
        await access_impl(path, access);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 获取文件信息
 */
export async function getStats(
    path: PathLike,
    opts?: GetStatsOptions & { bigint?: false },
): Promise<Stat>;
export async function getStats(
    path: PathLike,
    opts: GetStatsOptions & { bigint: true },
): Promise<BigIntStat>;
export async function getStats(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<Stat | BigIntStat>;
export async function getStats(
    path: PathLike,
    opts: GetStatsOptions = {},
): Promise<Stat | BigIntStat> {
    const { bigint = false, preserveSymlinks = false } = opts;

    if (preserveSymlinks) {
        return await lstat(path, bigint);
    } else {
        return await stat(path, bigint);
    }
}

/**
 * 设置文件信息
 */
export async function setStats(
    path: PathLike,
    opts: SetStatsOptions = {},
): Promise<void> {
    const { mode, owner, time, preserveSymlinks = false } = opts;

    if (preserveSymlinks) {
        if (mode != null) {
            await lchmod(path, mode);
        }

        if (owner) {
            await lchown(path, Number(owner.userId), Number(owner.groupId));
        }

        if (time) {
            const accessTime = isBigInt(time.accessTime)
                ? Number(time.accessTime / BigInt(1_000_000))
                : time.accessTime;
            const modifyTime = isBigInt(time.modifyTime)
                ? Number(time.modifyTime / BigInt(1_000_000))
                : time.modifyTime;
            await lutimes(path, Number(accessTime), Number(modifyTime));
        }
    } else {
        if (mode != null) {
            await chmod(path, mode);
        }

        if (owner) {
            await chown(path, Number(owner.userId), Number(owner.groupId));
        }

        if (time) {
            const accessTime = isBigInt(time.accessTime)
                ? Number(time.accessTime / BigInt(1_000_000))
                : time.accessTime;
            const modifyTime = isBigInt(time.modifyTime)
                ? Number(time.modifyTime / BigInt(1_000_000))
                : time.modifyTime;
            await utimes(path, Number(accessTime), Number(modifyTime));
        }
    }
}

/**
 * 检查文件或目录是否存在
 */
export async function exists(path: PathLike): Promise<boolean> {
    return await hasAccess(path);
}

/**
 * 获取文件权限
 */
export async function getMode(
    path: PathLike,
    opts?: PickKey<GetStatsOptions, "preserveSymlinks">,
): Promise<Mode> {
    const stats = await getStats(path, opts);
    return stats.mode;
}

/**
 * 设置文件权限
 */
export async function setMode(
    path: PathLike,
    mode: Mode,
    opts: PickKey<SetStatsOptions, "preserveSymlinks"> & {
        /**
         * 子目录权限
         *
         * 当 {@link recursive} 为 `true` 时，可传入此选项以另外指定子目录的权限。
         *
         * @default 传入的 `mode` 参数值
         */
        subDirMode?: Mode;

        /**
         * 是否递归地设置权限
         *
         * @default false
         */
        recursive?: boolean;
    } = {},
): Promise<void> {
    const {
        preserveSymlinks = false,
        recursive = false,
        subDirMode = mode,
    } = opts;
    if (recursive) {
        // TODO readdir(path,)
    } else {
        if (preserveSymlinks) {
            await lchmod(path, mode);
        } else {
            await chmod(path, mode);
        }
    }
}

/**
 * 获取文件所有者
 */
export async function getOwner(
    path: PathLike,
    opts?: GetStatsOptions & { bigint?: false },
): Promise<{ userId: number; groupId: number }>;
export async function getOwner(
    path: PathLike,
    opts: GetStatsOptions & { bigint: true },
): Promise<{ userId: bigint; groupId: bigint }>;
export async function getOwner(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<{ userId: number | bigint; groupId: number | bigint }>;
export async function getOwner(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<{ userId: number | bigint; groupId: number | bigint }> {
    const stats = await getStats(path, opts);
    return {
        userId: stats.userId,
        groupId: stats.groupId,
    };
}

/**
 * 设置文件所有者
 */
export async function setOwner(
    path: PathLike,
    userId: number | bigint,
    groupId: number | bigint,
    opts: PickKey<SetStatsOptions, "preserveSymlinks"> & {
        /**
         * 是否递归地设置权限
         *
         * @default false
         */
        recursive?: boolean;
    } = {},
): Promise<void> {
    const { preserveSymlinks = false, recursive = false } = opts;

    if (recursive) {
        // TODO readdir(path,)
    } else {
        if (preserveSymlinks) {
            await lchown(path, Number(userId), Number(groupId));
        } else {
            await chown(path, Number(userId), Number(groupId));
        }
    }
}

/**
 * 获取文件大小（字节）
 */
export async function getSize(
    path: PathLike,
    opts?: GetStatsOptions & { bigint?: false },
): Promise<number>;
export async function getSize(
    path: PathLike,
    opts: GetStatsOptions & { bigint: true },
): Promise<bigint>;
export async function getSize(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<number | bigint>;
export async function getSize(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<number | bigint> {
    const stats = await getStats(path, opts);
    return stats.size;
}

/**
 * 设置文件时间戳
 */
export async function setTime(
    path: PathLike,
    accessTime: number | bigint,
    modifyTime: number | bigint,
    opts: PickKey<SetStatsOptions, "preserveSymlinks"> = {},
): Promise<void> {
    const { preserveSymlinks = false } = opts;

    const _accessTime = isBigInt(accessTime)
        ? Number(accessTime / BigInt(1_000_000))
        : accessTime;
    const _modifyTime = isBigInt(modifyTime)
        ? Number(modifyTime / BigInt(1_000_000))
        : modifyTime;

    if (preserveSymlinks) {
        await lutimes(path, _accessTime, _modifyTime);
    } else {
        await utimes(path, _accessTime, _modifyTime);
    }
}

/**
 * 获取文件上次访问时间（毫秒）
 */
export async function getAccessTime(
    path: PathLike,
    opts?: GetStatsOptions & { bigint?: false },
): Promise<number>;
export async function getAccessTime(
    path: PathLike,
    opts: GetStatsOptions & { bigint: true },
): Promise<bigint>;
export async function getAccessTime(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<number | bigint>;
export async function getAccessTime(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<number | bigint> {
    const stats = await getStats(path, opts);
    return stats.accessTime;
}

/**
 * 获取文件最后修改时间（毫秒）
 */
export async function getModifiedTime(
    path: PathLike,
    opts?: GetStatsOptions & { bigint?: false },
): Promise<number>;
export async function getModifiedTime(
    path: PathLike,
    opts: GetStatsOptions & { bigint: true },
): Promise<bigint>;
export async function getModifiedTime(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<number | bigint>;
export async function getModifiedTime(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<number | bigint> {
    const stats = await getStats(path, opts);
    return stats.modifyTime;
}

/**
 * 获取文件状态最后变更时间（毫秒）
 */
export async function getChangeTime(
    path: PathLike,
    opts?: GetStatsOptions & { bigint?: false },
): Promise<number>;
export async function getChangeTime(
    path: PathLike,
    opts: GetStatsOptions & { bigint: true },
): Promise<bigint>;
export async function getChangeTime(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<number | bigint>;
export async function getChangeTime(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<number | bigint> {
    const stats = await getStats(path, opts);
    return stats.changeTime;
}

/**
 * 获取文件创建时间（毫秒）
 */
export async function getBirthTime(
    path: PathLike,
    opts?: GetStatsOptions & { bigint?: false },
): Promise<number>;
export async function getBirthTime(
    path: PathLike,
    opts: GetStatsOptions & { bigint: true },
): Promise<bigint>;
export async function getBirthTime(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<number | bigint>;
export async function getBirthTime(
    path: PathLike,
    opts?: GetStatsOptions,
): Promise<number | bigint> {
    const stats = await getStats(path, opts);
    return stats.birthTime;
}

/**
 * 检查路径是否为文件
 */
export async function isFile(
    path: PathLike,
    opts?: PickKey<GetStatsOptions, "preserveSymlinks">,
): Promise<boolean> {
    try {
        const stats = await getStats(path, opts);
        return stats.isFile();
    } catch (error) {
        return false;
    }
}

/**
 * 检查路径是否为目录
 */
export async function isDir(
    path: PathLike,
    opts?: PickKey<GetStatsOptions, "preserveSymlinks">,
): Promise<boolean> {
    try {
        const stats = await getStats(path, opts);
        return stats.isDirectory();
    } catch (error) {
        return false;
    }
}

/**
 * 检查路径是否为符号链接
 */
export async function isSymlink(path: PathLike): Promise<boolean> {
    try {
        const stats = await getStats(path, { preserveSymlinks: true });
        return stats.isSymbolicLink();
    } catch (error) {
        return false;
    }
}

/**
 * 检查目录是否为空
 */
export async function isEmptyDir(path: PathLike): Promise<boolean> {
    try {
        const items = await readDir(path);
        return items.length === 0;
    } catch (error) {
        return false;
    }
}

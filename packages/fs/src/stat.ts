import { access as access_impl } from "./impls/nodejs/fs.js";
import { Access, type Mode, type Type, type Uint8String } from "./shared.js";

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
export interface Stat extends Dirent {
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
 * 测试是否对指定路径有访问权限
 */
export async function hasAccess(
    path: string | Uint8String,
    access: Access = Access.Visible,
) {
    try {
        await access_impl(path, access);
        return true;
    } catch (error) {
        return false;
    }
}

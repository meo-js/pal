/**
 * @module
 *
 * @internal
 */
import { resolve } from "@meojs/path";
import type { PickKey } from "@meojs/std/object";
import {
    constants,
    Dirent as Dirent_Impl,
    Stats as Stats_Impl,
    type BigIntStats as BigIntStats_Impl,
} from "fs";
import { Mode, Type } from "../../shared.js";
import type {
    BigIntStat as I_BigIntStat,
    Dirent as I_Dirent,
    Stat as I_Stat,
} from "../../stat.js";

/**
 * {@link I_Dirent} 的 NodeJS 实现
 */
export class Dirent implements I_Dirent {
    protected _impl: Dirent_Impl;
    protected _path: string;

    constructor(impl: Dirent_Impl) {
        this._impl = impl;
        this._path = resolve(impl.parentPath, impl.name);
    }

    get type(): Type {
        if (this.isFile()) return Type.File;
        if (this.isDirectory()) return Type.Directory;
        if (this.isSymbolicLink()) return Type.SymbolicLink;
        if (this.isBlockDevice()) return Type.BlockDevice;
        if (this.isCharacterDevice()) return Type.CharacterDevice;
        if (this.isFIFO()) return Type.FIFO;
        if (this.isSocket()) return Type.Socket;
        return Type.Unknown;
    }

    get path(): string {
        return this._path;
    }

    isBlockDevice(): boolean {
        return this._impl.isBlockDevice();
    }

    isCharacterDevice(): boolean {
        return this._impl.isCharacterDevice();
    }

    isDirectory(): boolean {
        return this._impl.isDirectory();
    }

    isFIFO(): boolean {
        return this._impl.isFIFO();
    }

    isFile(): boolean {
        return this._impl.isFile();
    }

    isSocket(): boolean {
        return this._impl.isSocket();
    }

    isSymbolicLink(): boolean {
        return this._impl.isSymbolicLink();
    }
}

// Stat 和 BigIntStat 两种类型的共有属性
type I_StatBase = PickKey<
    I_Stat,
    | "type"
    | "mode"
    | "isBlockDevice"
    | "isCharacterDevice"
    | "isDirectory"
    | "isFIFO"
    | "isFile"
    | "isSocket"
    | "isSymbolicLink"
>;

/**
 * {@link I_StatBase} 的 NodeJS 实现
 */
class StatBase<T extends Stats_Impl | BigIntStats_Impl> implements I_StatBase {
    protected _impl: T;

    constructor(impl: T) {
        this._impl = impl;
    }

    get type(): Type {
        const mode = Number(this._impl.mode);
        const typeMask = mode & constants.S_IFMT;

        if (typeMask === constants.S_IFREG) return Type.File;
        if (typeMask === constants.S_IFDIR) return Type.Directory;
        if (typeMask === constants.S_IFLNK) return Type.SymbolicLink;
        if (typeMask === constants.S_IFBLK) return Type.BlockDevice;
        if (typeMask === constants.S_IFCHR) return Type.CharacterDevice;
        if (typeMask === constants.S_IFIFO) return Type.FIFO;
        if (typeMask === constants.S_IFSOCK) return Type.Socket;

        return Type.Unknown;
    }

    get mode(): Mode {
        let mode: Mode = 0;
        const rawMode = Number(this._impl.mode);

        // 用户权限
        if (rawMode & constants.S_IRUSR) mode |= Mode.Owner_R;
        if (rawMode & constants.S_IWUSR) mode |= Mode.Owner_W;
        if (rawMode & constants.S_IXUSR) mode |= Mode.Owner_X;

        // 组权限
        if (rawMode & constants.S_IRGRP) mode |= Mode.Group_R;
        if (rawMode & constants.S_IWGRP) mode |= Mode.Group_W;
        if (rawMode & constants.S_IXGRP) mode |= Mode.Group_X;

        // 其他用户权限
        if (rawMode & constants.S_IROTH) mode |= Mode.Other_R;
        if (rawMode & constants.S_IWOTH) mode |= Mode.Other_W;
        if (rawMode & constants.S_IXOTH) mode |= Mode.Other_X;

        return mode;
    }

    isBlockDevice(): boolean {
        return this._impl.isBlockDevice();
    }

    isCharacterDevice(): boolean {
        return this._impl.isCharacterDevice();
    }

    isDirectory(): boolean {
        return this._impl.isDirectory();
    }

    isFIFO(): boolean {
        return this._impl.isFIFO();
    }

    isFile(): boolean {
        return this._impl.isFile();
    }

    isSocket(): boolean {
        return this._impl.isSocket();
    }

    isSymbolicLink(): boolean {
        return this._impl.isSymbolicLink();
    }
}

/**
 * {@link I_Stat} 的 NodeJS 实现
 */
export class Stat extends StatBase<Stats_Impl> implements I_Stat {
    public get userId(): number {
        return this._impl.uid;
    }

    public get groupId(): number {
        return this._impl.gid;
    }

    get size(): number {
        return this._impl.size;
    }

    get accessTime(): number {
        return this._impl.atimeMs;
    }

    get modifyTime(): number {
        return this._impl.mtimeMs;
    }

    get changeTime(): number {
        return this._impl.ctimeMs;
    }

    get birthTime(): number {
        return this._impl.birthtimeMs;
    }
}

/**
 * {@link I_BigIntStat} 的 NodeJS 实现
 */
export class BigIntStat
    extends StatBase<BigIntStats_Impl>
    implements I_BigIntStat
{
    get userId(): bigint {
        return this._impl.uid;
    }
    get groupId(): bigint {
        return this._impl.gid;
    }

    get size(): bigint {
        return this._impl.size;
    }

    get accessTime(): bigint {
        return this._impl.atimeNs;
    }

    get modifyTime(): bigint {
        return this._impl.mtimeNs;
    }

    get changeTime(): bigint {
        return this._impl.ctimeNs;
    }

    get birthTime(): bigint {
        return this._impl.birthtimeNs;
    }
}

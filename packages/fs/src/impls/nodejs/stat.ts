import { resolve } from "@meojs/utils/path";
import { constants, Dirent as Dirent_Impl, Stats as Stats_Impl } from "fs";
import { Mode, Type } from "../../shared.js";
import type { Dirent as I_Dirent, Stat as I_Stat } from "../../stat.js";

/**
 * {@inheritdoc I_Dirent}
 */
export class Dirent implements I_Dirent {
    protected _impl: Dirent_Impl;

    constructor(impl: Dirent_Impl) {
        this._impl = impl;
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
        const { parentPath, name } = this._impl;
        return resolve(parentPath, name);
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
 * {@inheritdoc I_Stat}
 */
export class Stat implements I_Stat {
    protected _path: string;
    protected _impl: Stats_Impl;

    constructor(path: string, impl: Stats_Impl) {
        this._path = path;
        this._impl = impl;
    }

    get type(): Type {
        const mode = this._impl.mode;
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

    get path(): string {
        return this._path;
    }

    get mode(): Mode {
        let mode: Mode = 0;
        const rawMode = this._impl.mode;

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

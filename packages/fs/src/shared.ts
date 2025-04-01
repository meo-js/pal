import { BaseError, createErrorFactory } from "@meojs/utils";

/**
 * 数据编码枚举
 */
export enum Encoding {
    Utf8 = "utf8",
    Utf16le = "utf16le",
    Base64 = "base64",
    Base64url = "base64url",
    Latin1 = "latin1",
    Hex = "hex",
    Binary = "binary",
}

/**
 * 文件权限模式掩码枚举
 *
 * 你也可以使用八进制数值来表示权限模式掩码，例如 `0o755`。
 *
 * - 左：所有者的权限
 * - 中：组的权限
 * - 右：其他用户的权限
 *
 * 八进制数值权限表格：
 *
 * | 数字 | 权限 | 描述          |
 * | :-: | :--: | :----------- |
 * |  0  | --- | 无权限         |
 * |  1  | --x | 执行           |
 * |  2  | -w- | 写入           |
 * |  3  | -wx | 写入、执行      |
 * |  4  | r-- | 读取           |
 * |  5  | r-x | 读取、执行      |
 * |  6  | rw- | 读取、写入      |
 * |  7  | rwx | 读取、写入、执行 |
 *
 * @example 基本用法
 * ```ts
 * Mode.Owner_RWX | Mode.Group_RWX | Mode.Other_RWX
 * ```
 */
export enum Mode {
    Owner_N = 0o000,
    Owner_X = 0o100,
    Owner_W = 0o200,
    Owner_R = 0o400,
    Owner_WX = 0o300,
    Owner_RX = 0o500,
    Owner_RW = 0o600,
    Owner_RWX = 0o700,

    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- checked.
    Group_N = 0o000,
    Group_X = 0o010,
    Group_W = 0o020,
    Group_R = 0o040,
    Group_WX = 0o030,
    Group_RX = 0o050,
    Group_RW = 0o060,
    Group_RWX = 0o070,

    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- checked.
    Other_N = 0o000,
    Other_X = 0o001,
    Other_W = 0o002,
    Other_R = 0o004,
    Other_WX = 0o003,
    Other_RX = 0o005,
    Other_RW = 0o006,
    Other_RWX = 0o007,
}

/**
 * 文件访问权限枚举
 */
export enum Access {
    /**
     * 文件可见，这可以用于确认文件是否存在。
     */
    Visible = 1 << 0,

    /**
     * 文件可读
     */
    Read = 1 << 1,

    /**
     * 文件可写
     */
    Write = 1 << 2,

    /**
     * 文件可执行
     */
    Execute = 1 << 3,
}

/**
 * 文件类型枚举
 */
export enum Type {
    File,
    Directory,
    BlockDevice,
    CharacterDevice,
    FIFO,
    Socket,
    SymbolicLink,
    Unknown,
}

/**
 * 存储在 {@link Uint8Array} 中的字符串类型
 */
export type Uint8String = Uint8Array;

/**
 * 文件系统错误代码枚举
 */
export enum ErrorCode {
    /**
     * 已达到系统允许的最大文件描述符数量，无法打开更多文件
     */
    TooManyOpen,

    /**
     * 文件或目录不存在
     */
    NotExist,

    /**
     * 没有足够的权限进行操作
     */
    NoPermission,

    /**
     * 内部错误
     *
     * 可以访问 {@link Error.cause} 获取具体错误原因
     */
    InternalError,
}

/**
 * 文件系统错误类
 */
export class Error extends BaseError<ErrorCode> {}

/**
 * 文件系统错误创建工厂
 */
export const e = createErrorFactory(Error, ErrorCode);

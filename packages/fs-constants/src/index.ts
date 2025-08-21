/**
 * @public
 * @module
 */

/**
 * 数据编码枚举
 */
export enum Encoding {
  Utf8 = 'utf8',
  Utf16le = 'utf16le',
  Utf16be = 'utf16be',
  Base64 = 'base64',
  Base64url = 'base64url',
  Latin1 = 'latin1',
  Hex = 'hex',
  Binary = 'binary',
}

/**
 * 字符串编码枚举
 *
 * 即 {@link Encoding} 枚举排除 {@link Encoding.Binary} 以外的所有格式。
 */
export type StringEncoding = Exclude<Encoding, Encoding.Binary>;

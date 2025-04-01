import { rm } from "./impls/nodejs/fs.js";
import type { Uint8String } from "./shared.js";

/**
 * 删除文件或目录
 */
export async function remove(path: string | Uint8String) {
    await rm(path, { recursive: true, force: true });
}

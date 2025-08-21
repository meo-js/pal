import type { PathLike } from '@meojs/path';
import { rm } from './impls/nodejs/fs.js';

/**
 * 删除文件或目录
 */
export async function remove(path: PathLike) {
  await rm(path, { recursive: true, force: true });
}

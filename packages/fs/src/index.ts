/**
 * @public
 *
 * @module
 */
// TODO API 接口计划

// 写入、修改操作默认会覆盖、不存在则创建、递归地执行。
// 通过 opts 选择如何处理符号链接。
// 自行处理 graceful-fs 问题
// 返回的路径永远是 Unix 风格
// 处理嵌套的符号链接（现在已知 read 不支持）
// 处理 MacOS Alias（https://www.npmjs.com/package/macos-alias）
// 处理垃圾文件（https://www.npmjs.com/package/junk）
// 视文件名为至少兼容 ASCII 编码的内容，具体来说 0x0 (ASCII Nul) and 0x2f (ASCII '/') 是特殊字符
// // 以 NodeJS 实现为例，Ntfs 这类文件系统编码是 UTF-16，但以 Buffer 形式读取时，依然会转换为 UTF-8 编码

// 文件 ✅
// write(path, data);（提供数据则覆盖，提供函数则将旧数据传入并以返回值为写入数据）
// read(path);
// -
// append(path, data);（不允许传入函数，因为这个方法存在是因为降低内存占用）
// truncate(path, length);

// 目录 ✅
// makeDir(path);
// makeParentDir(path);
// readDir(path);

// 软/硬链接
// makeLink();
// makeSymlink();
// resolveSymlink();
// -
// toRealPath();

// 元信息 ✅
// getStats();
// setStats();
// -
// exists();
// hasAccess();
// getMode();
// setMode();
// getOwner();
// setOwner();
// getSize();
// setTime();
// getAccessTime();
// getModifiedTime();
// getChangeTime();
// getBirthTime();
// isFile();
// isDir();
// isSymlink();
// isEmptyDir();

// 通用
// remove();
// copy();
// rename();
// move();
// lock();（光是 flags 在 unix 不能独占文件，需第三方库 flock）

// 遍历与查找
// glob();
// walk();（直接返回数组、流，正确处理嵌套循环、符号链接不重复遍历）

// 监听变动
// watch();

// 工具
// makeTempDir();
// getSpecialPath();
// getDrives();
// getPartitions();
// getVolumes();

// 句柄操作
// open();
// openDir();
// close();
// class File（可异步迭代，会自动关闭）
// class Dir（可异步迭代，会自动关闭）

// 流式接口
// readStream();
// writeStream();

// 可以流的方式替换文件内容：https://github.com/signicode/rw-stream/
// 主要配置类型的扩展接口（类似 https://github.com/unjs/confbox 的另一个包，包括 writeText）

// #export * from "!sub-modules"
// #region Generated exports
export * from "./file.js";
// #endregion

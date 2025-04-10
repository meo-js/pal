import { readDir } from "./dir.js";
import { e, Encoding, type Uint8String } from "./shared.js";
import { getStats, type Dirent } from "./stat.js";

/**
 * 遍历选项
 */
export interface WalkOptions {
    /**
     * 允许同时进行的操作数
     *
     * @default Number.POSITIVE_INFINITY
     */
    concurrency?: number;

    /**
     * 控制内部缓冲区大小
     *
     * @default Number.POSITIVE_INFINITY
     */
    highWaterMark?: number;

    /**
     * 递归深度
     *
     * @default Number.POSITIVE_INFINITY
     */
    depth?: number;

    /**
     * 指定返回文件路径的编码格式
     *
     * 所有数据编码均为小端序。
     *
     * @default Encoding.Utf8
     */
    encoding?: Encoding;

    /**
     * 返回目录项对象而不是路径字符串
     *
     * @default false
     */
    withDirent?: boolean;

    /**
     * 过滤器
     *
     * - 排除条目
     * - 控制是否遍历指定条目的子条目
     */
    filter?: never;

    /**
     * - 是否解析 Symbol（解析则会返回指向条目的类型，否则返回符号链接的类型）
     * - 解析的话，可选择返回原路径还是原始路径
     * - 解析的话，如果 Symbol 是目录，选择是否遍历
     * - 遍历的话，是否避免可能发生的重复遍历，避免无限嵌套循环
     */
    whatSymlink?: never;

    /**
     * 出错时立即中止后续操作并返回，否则会尽可能地执行，但最终会以 {@link AggregateError} 拒绝
     *
     * @default false
     */
    abortOnError?: boolean;
}

enum WalkState {
    Idle,
    Walking,
    Canceled,
}

interface WalkContext {
    controller: ReadableStreamDefaultController<string | Uint8String | Dirent>;
    state: WalkState;
    queue: WalkItem[];
    processing: number;
    errors: Error[];
    resolver: PromiseWithResolvers<void> | null;

    // opts

    concurrency: number;
    depth: number;
    encoding: Encoding;
    withDirent: boolean;
    filter: never;
    whatSymlink: never;
    abortOnError: boolean;
}

interface WalkItem {
    depth: number;
    dirent: Dirent;
}

export function walk(
    path: string | Uint8String,
    opts?: WalkOptions,
): ReadableStream<string | Uint8String | Dirent> {
    const {
        concurrency = Number.POSITIVE_INFINITY,
        highWaterMark = Number.POSITIVE_INFINITY,
        depth = Number.POSITIVE_INFINITY,
        encoding = Encoding.Utf8,
        withDirent = false,
        filter,
        whatSymlink,
        abortOnError = false,
    } = opts ?? {};

    let ctx: WalkContext;

    return new ReadableStream<string | Uint8String | Dirent>(
        {
            async start(controller) {
                const stats = await getStats(path);
                if (!stats.isDirectory()) {
                    controller.error(e.WrongType("path is not a directory"));
                    return;
                }

                const items = (await readDir(path, { withDirent: true })).map(
                    v => ({ depth: 1, dirent: v }),
                );

                ctx = {
                    controller,
                    queue: items,
                    state: WalkState.Idle,
                    processing: 0,
                    errors: [],
                    resolver: null,

                    concurrency,
                    depth,
                    encoding,
                    withDirent,
                    filter: filter as never,
                    whatSymlink: whatSymlink as never,
                    abortOnError,
                };
            },
            async pull(controller) {
                const resolver = (ctx.resolver = Promise.withResolvers());
                handle(ctx);
                return resolver.promise;
            },
            async cancel(reason) {
                ctx.state = WalkState.Canceled;

                // 如果还有处理中的项目，则等待处理完毕才算完成取消操作
                if (ctx.processing > 0) {
                    if (!ctx.resolver) {
                        ctx.resolver = Promise.withResolvers();
                    }
                }

                return ctx.resolver?.promise;
            },
        },
        new CountQueuingStrategy({ highWaterMark }),
    );
}

function handle(ctx: WalkContext) {
    const { controller, withDirent, queue, concurrency } = ctx;

    if (ctx.state !== WalkState.Idle) return;
    ctx.state = WalkState.Walking;

    while (queue.length !== 0) {
        // 并行数量达到上限，直接返回，当有项目处理完毕后会再次调用本函数
        if (ctx.processing >= concurrency) {
            doneProcess(ctx);
            return;
        }

        // 流满了，结束本次拉取，当流有空余时会再次调用本函数
        if (controller.desiredSize! <= 0) {
            donePull(ctx);
            return;
        }

        const current = queue.pop()!;

        // 如果当前项深度大于最大深度，则跳过
        if (current.depth > ctx.depth) {
            continue;
        }

        pushToResult(ctx, current, withDirent);

        // 如果当前项深度即是最大深度，则无需获取子项
        if (current.depth === ctx.depth) {
            continue;
        }

        if (current.dirent.isDirectory()) {
            void handleDirectory(ctx, current);
        } else if (current.dirent.isSymbolicLink()) {
            // TODO
        }
    }

    // 判断是否处理完毕，是则关闭流并返回
    if (ctx.processing === 0) {
        closeStream(ctx);
    } else {
        doneProcess(ctx);
    }
}

async function handleDirectory(ctx: WalkContext, dir: WalkItem) {
    ctx.processing++;

    const items = await readDir(dir.dirent.path, {
        withDirent: true,
    });

    if (asyncCheck(ctx)) {
        return;
    }

    for (const item of items) {
        ctx.queue.push({ depth: dir.depth + 1, dirent: item });
    }

    ctx.processing--;
    handle(ctx);
}

/**
 * 该函数需与 processing 配合使用
 */
function asyncCheck(ctx: WalkContext) {
    if (ctx.state === WalkState.Canceled) {
        ctx.processing--;
        if (ctx.processing === 0) {
            donePull(ctx);
        }
        return true;
    } else {
        return false;
    }
}

function doneProcess(ctx: WalkContext) {
    if (ctx.state === WalkState.Walking) {
        ctx.state = WalkState.Idle;
    }
}

function donePull(ctx: WalkContext) {
    doneProcess(ctx);
    ctx.resolver?.resolve();
    ctx.resolver = null;
}

function closeStream(ctx: WalkContext) {
    doneProcess(ctx);
    donePull(ctx);
    ctx.controller.close();
}

function pushToResult(
    { controller }: WalkContext,
    item: WalkItem,
    withDirent: boolean,
) {
    if (withDirent) {
        controller.enqueue(item.dirent);
    } else {
        controller.enqueue(item.dirent.path);
    }
}

// console.log(await readDir("./temp", { withDirent: true }));
// console.log(await readDir("./temp", { withDirent: false }));
// console.log(readlinkSync("./temp/broken_symlink"));
// console.log(readlinkSync("./temp/circle_tempa_symlink"));
// console.log(readlinkSync("./temp/broken_absolute_symlink"));
// console.log(readlinkSync("./temp/tempa-point-point"));
// console.log(realpathSync("./temp/tempa-point-point"));
// console.log(await read("./temp/c-point-point.json", Encoding.Utf8));

const reader = walk(".").getReader();
function read2() {
    reader
        .read()
        .then(res => {
            console.log(res);
            if (!res.done) {
                read2();
            }
        })
        .catch((error: unknown) => {
            console.error("Error reading directory:", error);
        });
}
read2();

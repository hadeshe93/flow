import { create as createMemFs } from 'mem-fs';
import memFsEditor, { Editor } from 'mem-fs-editor';

export interface MemFsCreator {
  (): Editor;
  fs: undefined | Editor;
}

/**
 * 创建内存文件系统的创建器
 *
 * @export
 * @returns 内存文件系统的创建器
 */
export function createMemFsCreator(): MemFsCreator {
  const create = () => {
    if (create.fs) return create.fs;
    const fsStore = createMemFs();
    const fs = memFsEditor.create(fsStore as any);
    create.fs = fs;
    return fs;
  };
  create.fs = undefined;
  return create;
}

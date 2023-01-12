import Debug from 'debug';
import type { Logger } from '../../../core/logger';
type Enquirer = typeof import('enquirer');

export interface PatcherCtx {
  // 要进行 patch 的目标路径
  targetPath: string;
  // 要进行 patch 的预设资源
  preset: string;
  // 要进行 patch 的预设资源的绝对路径
  presetAbsPath: string;
}

export interface PatcherUtils {
  // debug
  debug: Debug;
  // logger
  logger: Logger;
  // 传递下去给不同周期使用的 enquirer
  enquirer?: Enquirer;
  // 拷贝 asset 文件的函数
  copyAsset?: (src: string, dest: string) => any;
  // 写 asset 文件的函数
  writeAsset?: (fileContent: string, dest: string) => any;
}

import type { Logger } from '../../../core/logger';
type Enquirer = typeof import('enquirer');

export interface PatcherCtx {
  // 要进行 patch 的目标路径
  targetPath: string;
  // 要进行 patch 的预设资源
  preset: string;
  // 要进行 patch 的预设资源的绝对路径
  presetAbsPath: string;
  // logger
  logger: Logger;
  // 传递下去给不同周期使用的 enquirer
  enquirer?: Enquirer;
}

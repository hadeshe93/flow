import path from 'path';
import execa from 'execa';
import fsExtra from 'fs-extra';
import { Injectable, Autowired } from '@opensumi/di';

import { Logger } from '@/core';
import { debug } from '@/utils/debug';
import { AbstractInteractorImpl } from '@/core/interactor';
import { resolveGlobModules, requireResolve } from '@/utils/resolve';
import type { PatcherCtx, PatcherUtils } from './types/index';

type Enquirer = typeof import('enquirer');

interface PatcherOptions {
  cwd: string;
  preset: string;
}

const PRESETS_FOLDER_NAME = 'presets';
const PRESET_ENTRY_FILE_NAME = 'index';

export const Patcher = Symbol('Patcher');
export type Patcher = AbstractInteractorImpl;

@Injectable({ multiple: true })
export class PatcherImpl extends AbstractInteractorImpl implements Patcher {
  ctx: PatcherCtx = {
    targetPath: '',
    preset: '',
    presetAbsPath: '',
  };
  utils: PatcherUtils;

  @Autowired(Logger)
  logger: Logger;

  constructor() {
    super();
    this.utils = {
      debug,
      execa,
      logger: this.logger,
    };
  }

  async initialize(options: PatcherOptions): Promise<void> {
    const processCwd = process.cwd();
    // 可以通过传入 cwd 来改变执行路径，以方便调试
    const targetPath = options.cwd || processCwd;
    if (targetPath !== processCwd) {
      process.chdir(targetPath);
    }

    this.ctx.targetPath = targetPath;
    this.ctx.preset = options.preset;

    this.utils.copyAsset = this.createCopyAsset(this.ctx);
    this.utils.writeAsset = this.createWriteAsset(this.ctx);
  }

  async prompt(enquirer: Enquirer): Promise<void> {
    let presetAbsPath = '';
    if (!this.ctx.preset) {
      const presetList = getPresetList();
      const presetBaseNameList = getPresetList().map((moduleInfo) => moduleInfo.baseName);
      debug('[Patcher] presetsList:\r\n%O', presetBaseNameList);
      const question = {
        name: 'preset',
        message: 'Please choose a preset:',
        limit: 10,
        initial: 0,
        choices: presetBaseNameList,
      };
      const prompt = new enquirer['AutoComplete'](question);
      const preset = await prompt.run();
      presetAbsPath = presetList.find((moduleInfo) => moduleInfo.baseName === preset)?.absolutePath || '';
      this.ctx.preset = preset;
    } else {
      presetAbsPath = requireResolve(
        path.resolve(__dirname, PRESETS_FOLDER_NAME, this.ctx.preset, PRESET_ENTRY_FILE_NAME),
      );
    }
    if (!presetAbsPath) {
      throw new Error(`The preset "${this.ctx.preset}" is not found`);
    }
    this.ctx.presetAbsPath = presetAbsPath;
    this.utils.enquirer = enquirer;
  }

  async act(): Promise<void> {
    const theModule = require(this.ctx.presetAbsPath);
    const patchPreset = theModule?.default || theModule;
    await patchPreset(
      {
        ...this.ctx,
      },
      this.utils,
    );
    this.logger.success('Patch done successfully');
  }

  /**
   * 创建拷贝资源的函数
   *
   * @param {PatcherCtx} ctx
   * @returns {*}
   */
  private createCopyAsset(ctx: PatcherCtx) {
    return (src: string, dest: string) => {
      debug(`[Patcher - ${ctx.preset} - copyAsset] src:`, src);
      debug(`[Patcher - ${ctx.preset} - copyAsset] dest:`, dest);
      fsExtra.copySync(src, dest);
      this.logger.success(`[Patch] Inject file "${path.basename(dest)}" successfully`);
    };
  }

  /**
   * 创建写入资源的函数
   *
   * @param {PatcherCtx} ctx
   * @returns {*}
   */
  private createWriteAsset(ctx: PatcherCtx) {
    return (fileContent: string, dest: string) => {
      debug(`[Patcher - ${ctx.preset} - writeAsset] fileContent:`, fileContent);
      debug(`[Patcher - ${ctx.preset} - writeAsset] dest:`, dest);
      fsExtra.writeFileSync(dest, fileContent, { encoding: 'utf-8' });
      this.logger.success(`[Patch] Inject file "${path.basename(dest)}" successfully`);
    };
  }
}

/**
 * 获取 presets 列表
 *
 * @returns {*}  {ReturnType<typeof resolveGlobModules>}
 */
function getPresetList(): ReturnType<typeof resolveGlobModules> {
  return resolveGlobModules(path.resolve(__dirname, PRESETS_FOLDER_NAME, '*'), {
    entryFileName: PRESET_ENTRY_FILE_NAME,
    excludeInvalidModule: true,
  });
}

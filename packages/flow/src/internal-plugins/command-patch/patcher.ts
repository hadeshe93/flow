import path from 'path';
import { debug } from '../../utils/debug';
import { Interactor } from '../../core/interactor';
import { resolveGlobModules, requireResolve } from '../../utils/resolve';
import type { PatcherCtx } from './types/index';

type Enquirer = typeof import('enquirer');

interface PatcherOptions {
  cwd: string;
  preset: string;
}

const PRESET_ENTRY_FILE_NAME = 'index';
const PRESETS_FOLDER_NAME = 'presets';

export class Patcher extends Interactor {
  ctx: PatcherCtx = {
    targetPath: '',
    preset: '',
    presetAbsPath: '',
    logger: this.logger,
  };

  async initialize(options: PatcherOptions): Promise<void> {
    this.ctx.targetPath = options.cwd || process.cwd();
    this.ctx.preset = options.preset;
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
    this.ctx.enquirer = enquirer;
  }

  async act(): Promise<void> {
    const theModule = require(this.ctx.presetAbsPath);
    const patchPreset = theModule?.default || theModule;
    await patchPreset({
      ...this.ctx,
    });
    this.logger.success('Patch done successfully');
  }
}

function getPresetList(): ReturnType<typeof resolveGlobModules> {
  return resolveGlobModules(path.resolve(__dirname, PRESETS_FOLDER_NAME, '*'), {
    entryFileName: PRESET_ENTRY_FILE_NAME,
    excludeInvalidModule: true,
  });
}

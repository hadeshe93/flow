import Enquirer from 'enquirer';
import { Editor } from 'mem-fs-editor';

import { Interactor, OptionsForRunningInteractor } from '@/types/core';
import { createMemFsCreator } from '@/utils/memfs';

const createMemFs = createMemFsCreator();

/**
 * 交互器类
 *
 * @export
 * @abstract
 * @class Interactor
 */
export abstract class AbstractInteractorImpl implements Interactor {
  private fs = createMemFs();
  private enquirer = Enquirer;
  protected ctx: Record<string, any> = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async initialize(options?: OptionsForRunningInteractor): Promise<void> {
    // ...
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async prompt(enquirer: typeof Enquirer): Promise<void> {
    // ...
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async act(fs: Editor): Promise<void> {
    // ...
  }

  async end(): Promise<void> {
    // ...
  }

  async run(options?: OptionsForRunningInteractor) {
    await this.initialize?.(options);
    await this.prompt?.(this.enquirer);
    await this.act?.(this.fs);
    await this.end?.();
  }
}

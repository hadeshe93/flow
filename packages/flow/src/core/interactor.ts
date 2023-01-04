import Enquirer from 'enquirer';
import { Editor } from 'mem-fs-editor';

import { logger } from './logger';
import { configuration } from './configuration';
import { createMemFsCreator } from '../utils/memfs';

const createMemFs = createMemFsCreator();

type OptionsForRunningInteractor = Record<string, any>;

/**
 * 交互器类
 *
 * @export
 * @abstract
 * @class Interactor
 */
export abstract class Interactor {
  private fs = createMemFs();
  private enquirer = Enquirer;
  protected logger = logger;
  protected configuration = configuration;
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

  onError(err) {
    if (!err) return;
    this.logger.error('Error occurred:', err);
  }

  async run(options?: OptionsForRunningInteractor) {
    try {
      await this.initialize?.(options);
      await this.prompt?.(this.enquirer);
      await this.act?.(this.fs);
      await this.end?.();
    } catch (err) {
      await this.onError?.(err);
    }
  }
}

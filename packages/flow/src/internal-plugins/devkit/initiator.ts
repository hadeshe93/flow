import path from 'path';
import fsExtra from 'fs-extra';
import { Injectable, Autowired } from '@opensumi/di';
import { downloadGitRepo } from '@hadeshe93/lib-node';

import { Logger } from '@/types/core';
import { AbstractInteractorImpl } from '@/core/interactor';
import { TemplateFrameworkConfig } from './types/config';

interface InitiatorOptions {
  frameworkConfig: TemplateFrameworkConfig;
}

export const DevkitInitiator = Symbol('DevkitInitiatorImpl');
export type DevkitInitiator = AbstractInteractorImpl;

/**
 * 项目脚手架模板初始化类
 *
 * @export
 * @class Initiator
 * @extends {AbstractInteractorImpl}
 */
@Injectable({ multiple: true })
export class DevkitInitiatorImpl extends AbstractInteractorImpl implements DevkitInitiator {
  options: InitiatorOptions;

  @Autowired(Logger)
  logger: Logger;

  constructor(options: InitiatorOptions) {
    super();
    this.options = options;
  }

  async prompt(enquirer: typeof import('enquirer')): Promise<void> {
    const answerMap: { appName: string } = await enquirer.prompt([
      {
        type: 'input',
        name: 'appName',
        message: 'Please input your app name:',
      },
    ]);
    this.ctx.appName = answerMap.appName;
    this.ctx.dest = path.resolve(process.cwd(), answerMap.appName);
  }

  async act(): Promise<void> {
    const { frameworkConfig } = this.options;
    const destTplRepoPath = path.resolve(this.ctx.dest, `.temp-${new Date().getTime()}`);
    const destTplRealPath = path.resolve(destTplRepoPath, frameworkConfig.repoTemplatePath);
    this.ctx.destTplRepoPath = destTplRepoPath;
    this.ctx.destTplRealPath = destTplRealPath;

    await this.logger.ing('Downloading template ...', () => downloadGitRepo(frameworkConfig.repoUrl, destTplRepoPath));
    await fsExtra.copy(this.ctx.destTplRealPath, this.ctx.dest);
    this.logger.log();
    this.logger.info(`Please excute following instructions to install dependencies:`);
    this.logger.info(`  cd ${this.ctx.appName} && pnpm install`);
  }

  async end() {
    await fsExtra.remove(this.ctx.destTplRepoPath);
  }
}

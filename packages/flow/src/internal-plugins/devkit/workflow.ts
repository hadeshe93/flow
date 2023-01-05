import glob from 'glob';
import path from 'path';
import fsExtra from 'fs-extra';
import { PAGES_RELATIVE_PATH } from '@hadeshe93/wpconfig-core';
import BuilderCore, { formatBuilderConfig, BuilderConfig, SupportedBuilderMode } from '@hadeshe93/builder-core';
import BuilderWebpack from '@hadeshe93/builder-webpack';

import { Interactor } from '../../core/interactor';
import { getAliyunOssOper } from '../../utils/aliyun-oss';
import { getInternalPluginName } from '../../utils/plugin';
import { commandsOptionMap, builderModeMap } from './constants/configs';

type BaseOptionsForRunningWorkflow = {
  command?: string;
  pageName?: string;
  cwd?: string;
};

type OptionsForRunningWorkflow = BaseOptionsForRunningWorkflow & {
  accessKeyId?: string;
  accessKeySecret?: string;
  bucket?: string;
  region?: string;
};

interface WorkflowCtx {
  projectRootPath: string;
  projectPagesPath: string;
  options: OptionsForRunningWorkflow;
}

interface DeployAccessAnswer {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
}

interface OptionsForDeploy {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
}

export const OSS_ROOT_DIR = '/flow';

export class Workflow extends Interactor {
  ctx: WorkflowCtx = {
    projectRootPath: '',
    projectPagesPath: '',
    options: {},
  };

  async initialize(options: OptionsForRunningWorkflow): Promise<void> {
    const processCwd = process.cwd();
    // 可以通过传入 cwd 来改变执行路径，以方便调试
    const projectRootPath = options?.cwd || processCwd;
    if (projectRootPath !== processCwd) {
      process.chdir(projectRootPath);
    }
    this.ctx.projectRootPath = projectRootPath;
    this.ctx.projectPagesPath = path.resolve(projectRootPath, PAGES_RELATIVE_PATH);
    this.ctx.options = options;
  }

  async prompt(enquirer: typeof import('enquirer')): Promise<void> {
    const { options } = this.ctx;

    if (options.command === commandsOptionMap.deploy.command) {
      await this.ensureDeploymentAccess(options, enquirer);
    }

    // 如果外界没有指定 pageName，那么可以提供用户去手动选择
    if (!options.pageName) {
      const pagesList = glob
        .sync(path.join(this.ctx.projectPagesPath, '/*'))
        .map((pagePath) => path.basename(pagePath));
      const question = {
        name: 'pageName',
        message: 'Please target the page name:',
        limit: 10,
        initial: 0,
        choices: pagesList,
      };
      const prompt = new enquirer['AutoComplete'](question);
      this.ctx.options.pageName = await prompt.run();
    }
  }

  async act(): Promise<void> {
    const { options } = this.ctx;
    const { command } = options;
    // 调试或构建
    if ([commandsOptionMap.dev.command, commandsOptionMap.build.command].includes(command)) {
      await this.bootstrapBuilder();
      return;
    }
    // 部署
    if (commandsOptionMap.deploy.command === command) {
      await this.deploy({
        accessKeyId: options.accessKeyId,
        accessKeySecret: options.accessKeySecret,
        bucket: options.bucket,
        region: options.region,
      });
      return;
    }
  }

  /**
   * 启动 builder
   *
   * @private
   * @memberof Workflow
   */
  private async bootstrapBuilder() {
    const { projectRootPath, projectPagesPath, options } = this.ctx;
    const { command, pageName } = options;
    const mode = builderModeMap[command] as SupportedBuilderMode;
    if (!mode) {
      throw new Error(`Command '${command}' is not allowed.`);
    }

    // 构建配置
    const projectConfigPath = path.resolve(projectPagesPath, pageName, './project.config.js');
    const builderConfig: BuilderConfig = formatBuilderConfig({
      mode,
      builderName: 'webpack',
      appProjectConfig: {
        projectPath: projectRootPath,
        pageName,
        ...require(projectConfigPath),
      },
    });
    // 实例化核心 builder
    const builder = new BuilderCore({
      logger: this.logger,
    });
    // 实例化 webpack builder
    const webpackBuilder = new BuilderWebpack();
    // 注册 webpack builder
    builder.registerBuilder('webpack', webpackBuilder);
    const excutor = builder.createExcutor([builderConfig]);
    await excutor();
  }

  /**
   * 确保完善部署所需的参数
   *
   * @private
   * @param {OptionsForRunningWorkflow} options
   * @param {typeof import('enquirer')} enquirer
   * @memberof Workflow
   */
  private async ensureDeploymentAccess(options: OptionsForRunningWorkflow, enquirer: typeof import('enquirer')) {
    const needResetAccess = options['reset'] || false;
    const { plugins } = this.configuration.data;
    const thisPluginName = getInternalPluginName(__dirname);
    const internalDeployPluginIdx = plugins.findIndex((plugin) => plugin.name === thisPluginName);
    const { config: internalDeployPluginConfig = {} } = plugins[internalDeployPluginIdx];
    const hasAccessInConfig = internalDeployPluginConfig?.accessKeyId && internalDeployPluginConfig?.accessKeySecret;
    const hasAccessInOptions = options.accessKeyId && options.accessKeySecret;
    let accessKeyId = '';
    let accessKeySecret = '';
    let bucket = '';
    let region = '';

    if (hasAccessInOptions && !needResetAccess) {
      ({ accessKeyId, accessKeySecret, bucket, region } = options);
    } else if (hasAccessInConfig && !needResetAccess) {
      ({ accessKeyId, accessKeySecret, bucket, region } = internalDeployPluginConfig);
    } else {
      const message = needResetAccess
        ? 'Reseting aliyun oss configs for deploying. Please follow the instructions show below:'
        : 'You have not config aliyun oss for deploying. Please follow the instructions show below:';
      this.logger.warn(message);
      const answers = (await enquirer.prompt([
        {
          type: 'input',
          name: 'accessKeyId',
          message: 'Please config access-key-id of aliyun oss:',
        },
        {
          type: 'input',
          name: 'accessKeySecret',
          message: 'Please config access-key-secret of aliyun oss:',
        },
        {
          type: 'input',
          name: 'bucket',
          message: 'Please config bucket of aliyun oss:',
        },
        {
          type: 'input',
          name: 'region',
          message: 'Please config region of aliyun oss:',
        },
      ])) as DeployAccessAnswer;
      ({ accessKeyId, accessKeySecret, bucket, region } = answers);
      this.configuration.data.plugins[internalDeployPluginIdx].config = {
        ...(internalDeployPluginConfig || {}),
        accessKeyId,
        accessKeySecret,
        bucket,
        region,
      };
      this.configuration.save();
    }
    options.accessKeyId = accessKeyId;
    options.accessKeySecret = accessKeySecret;
    options.bucket = bucket;
    options.region = region;
  }

  async deploy(options: OptionsForDeploy) {
    const destDirPath = path.resolve(OSS_ROOT_DIR, path.basename(this.ctx.projectRootPath));
    const localDirPath = path.resolve(this.ctx.projectRootPath, 'dist');
    if (!(await fsExtra.pathExists(localDirPath))) throw new Error(`Path '${localDirPath}' does not exist.`);

    try {
      const { failedList } = await getAliyunOssOper(options).upload({
        destDirPath,
        localDirPath,
        beforeUpload: async (optionList) => {
          const localFileList = optionList.map(({ localFilePath }) => {
            const seps = localFilePath.split(path.sep);
            const distIndex = seps.indexOf('dist');
            return seps.slice(distIndex).join(path.sep);
          });
          this.logger.log(
            'These files listed below are ready to be uploaded:\r\n',
            JSON.stringify(localFileList, undefined, 2),
          );
          return optionList;
        },
      });
      if (failedList.length === 0) {
        this.logger.success('All files have been deployed successfully~');
      } else {
        this.logger.error('These files listed failed to be deployed.\r\n', JSON.stringify(failedList, undefined, 2));
      }
    } catch (err) {
      this.logger.warn('Exception occurred in deploying:', err);
      process.exit(1);
    }
  }
}

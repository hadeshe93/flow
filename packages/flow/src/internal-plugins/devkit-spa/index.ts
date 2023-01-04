import { Initiator } from './initiator';
import { WorkflowManager } from './workflow-manager';
import { templateFrameworkConfigs } from './constants/configs';
import { definePluigin } from '../../core';

export default definePluigin({
  apply(ctx) {
    // 注册项目模板
    templateFrameworkConfigs.forEach((frameworkConfig) => {
      ctx.initiatorManager.register({
        templateName: frameworkConfig.templateName,
        fn: () => {
          return new Initiator({ frameworkConfig });
        },
      });
    });

    const COMMON_OPTION_MAP = {
      cwd: {
        description: 'Specify current working directory',
        valueName: 'path',
      },
    };

    // 注册开发调试命令
    const DEV_COMMAND_OPTIONS = {
      command: 'spa:dev',
      description: 'Develope page of spa project',
      optionMap: {
        ...COMMON_OPTION_MAP,
        pageName: {
          description: 'Specify the name of page',
          valueName: 'pageName',
        },
      },
    };
    ctx.commander.register({
      ...DEV_COMMAND_OPTIONS,
      fn: (options) => {
        const wfManager = new WorkflowManager();
        wfManager.run({
          command: DEV_COMMAND_OPTIONS.command,
          ...options,
        });
      },
    });

    // 注册构建命令
    const BUILD_COMMAND_OPTIONS = {
      command: 'spa:build',
      description: 'Build page of spa project',
      optionMap: {
        ...COMMON_OPTION_MAP,
      },
    };
    ctx.commander.register({
      ...BUILD_COMMAND_OPTIONS,
      fn: (options) => {
        const wfManager = new WorkflowManager();
        wfManager.run({
          command: BUILD_COMMAND_OPTIONS.command,
          ...options,
        });
      },
    });

    // 注册部署命令
    const DEPLOY_COMMAND_OPTIONS = {
      command: 'spa:deploy',
      description: 'Deploy page of spa project',
      argumentList: [
        [
          'pageName',
          {
            description: 'The target page name',
            required: false,
          },
        ],
      ] as any,
      optionMap: {
        ...COMMON_OPTION_MAP,
        reset: {
          description: 'Reset configs of aliyun oss',
        },
        accessKeyId: {
          description: 'Specify the temporary accessKeyId for aliyun oss',
          valueName: 'id',
        },
        accessKeySecret: {
          description: 'Specify the temporary accessKeySecret for aliyun oss',
          valueName: 'secret',
        },
        bucket: {
          description: 'Specify the bucket for aliyun oss',
          valueName: 'bucket',
        },
        region: {
          description: 'Specify the region for aliyun oss',
          valueName: 'region',
        },
      },
    };
    ctx.commander.register({
      ...DEPLOY_COMMAND_OPTIONS,
      fn: (options) => {
        const wfManager = new WorkflowManager();
        wfManager.run({
          command: DEPLOY_COMMAND_OPTIONS.command,
          ...options,
        });
      },
    });
  },
});

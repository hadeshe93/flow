import { Initiator } from './initiator';
import { Workflow } from './workflow';
import { templateFrameworkConfigs, commandsOptionMap } from './constants/configs';
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

    // 注册命令
    [commandsOptionMap.dev, commandsOptionMap.build, commandsOptionMap.deploy].forEach((commandOption) => {
      ctx.commander.register({
        ...commandOption,
        fn: (options) => {
          const workflow = new Workflow();
          workflow.run({
            command: commandOption.command,
            ...options,
          });
        },
      });
    });
  },
});

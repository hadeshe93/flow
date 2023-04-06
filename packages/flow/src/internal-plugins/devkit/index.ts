import { Injector, Injectable, Autowired } from '@opensumi/di';
import {
  Domain,
  Plugger,
  BasicPlugin,
  CommandContribution,
  InitiatorManagerContribution,
  CommandRegistry,
  InitiatorManagerRegistry,
  Logger,
  Configuration,
} from '@/core';
import { DevkitInitiatorImpl, DevkitInitiator } from './initiator';
import { DevkitWorkflowImpl, DevkitWorkflow } from './workflow';
import { templateFrameworkConfigs, commandsOptionMap } from './constants/configs';

@Domain(CommandContribution, InitiatorManagerContribution)
class DevkitContribution implements CommandContribution, InitiatorManagerContribution {
  injector: Injector = new Injector();

  @Autowired(Plugger)
  plugger: Plugger;

  @Autowired(Logger)
  logger: Logger;

  @Autowired(Configuration)
  configuration: Configuration;

  constructor() {
    // 向下提供
    this.injector.addProviders(
      {
        token: Logger,
        useValue: this.logger,
      },
      {
        token: Configuration,
        useValue: this.configuration,
      },
      {
        token: DevkitInitiator,
        useClass: DevkitInitiatorImpl,
      },
      {
        token: DevkitWorkflow,
        useClass: DevkitWorkflowImpl,
      },
    );
  }

  /**
   * 注册模板
   *
   * @param {InitiatorManagerRegistry} initiatorManagerRegistry
   * @memberof DevkitContribution
   */
  registerInitiator(initiatorManagerRegistry: InitiatorManagerRegistry) {
    templateFrameworkConfigs.forEach((frameworkConfig) => {
      initiatorManagerRegistry.registerInitiator({
        templateName: frameworkConfig.templateName,
        fn: () => {
          const initiator = this.injector.get(DevkitInitiator, [{ frameworkConfig }]);
          return initiator;
        },
      });
    });
  }

  /**
   * 注册命令
   *
   * @param {CommandRegistry} commandRegistry
   * @memberof DevkitContribution
   */
  registerCommand(commandRegistry: CommandRegistry): void {
    [commandsOptionMap.dev, commandsOptionMap.build, commandsOptionMap.deploy].forEach((commandOption) => {
      commandRegistry.registerCommand({
        ...commandOption,
        fn: (options) => {
          const workflow = this.injector.get(DevkitWorkflow);
          workflow.run({
            command: commandOption.command,
            ...options,
          });
        },
      });
    });
  }
}

@Injectable()
export default class DevkitPlugin extends BasicPlugin {
  providers = [DevkitContribution];
}

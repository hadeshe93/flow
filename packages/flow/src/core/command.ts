import minimist from 'minimist';
import OriginalCommander from 'commander';
import { Injectable, Autowired } from '@opensumi/di';

import {
  Logger,
  ContributionProvider,
  Command,
  CommandRegistry,
  CommandDetail,
  CommandContribution,
} from '@/types/core';
import { getPackageJSON } from '@/utils/package-json';

@Injectable()
export class CommandRegistryImpl implements CommandRegistry {
  protected readonly program = new OriginalCommander.Command();
  protected readonly commandsMap: Map<string, CommandDetail> = new Map();

  @Autowired(Logger)
  logger: Logger;

  @Autowired(CommandContribution)
  private commandContributionProvider: ContributionProvider<CommandContribution>;

  constructor() {
    const packageJson = getPackageJSON();
    const CLI_NAME = Object.keys(packageJson.bin || {})?.[0] || 'flow';
    this.program.name(CLI_NAME).usage('<command> [options]').version(packageJson.version);
    this.program.on('--help', () => {
      this.logger.log('');
      this.logger.log(`Run ${CLI_NAME} <command> --help for detailed usage of given command.`);
    });
  }

  /**
   * 初始化贡献点
   *
   * @memberof CommandRegistryImpl
   */
  initialize(): void {
    const contributions = this.commandContributionProvider.getContributions();
    for (const contribution of contributions) {
      contribution.registerCommand(this);
    }
  }

  /**
   * 注册命令
   *
   * @param {CommandDetail} commandDetail
   * @returns {*}
   * @memberof CommandRegistryImpl
   */
  registerCommand(commandDetail: CommandDetail) {
    const { command: commandName } = commandDetail;
    const existedCommandDetail = this.commandsMap.get(commandName);
    if (existedCommandDetail) {
      this.logger.error(
        `Command '${commandName}' cannot be registered by ${commandDetail.pluginName} because of ${existedCommandDetail.pluginName}`,
      );
      return false;
    }
    this.commandsMap.set(commandName, commandDetail);

    // 设置 command
    const commandDefinition = this.program.command(commandName).description(commandDetail.description);
    if (commandDetail.argumentList) {
      let doneRequired = false;
      commandDetail.argumentList.forEach(([argumentName, argumentInfo]) => {
        // 禁止有 required 在后面才定义，必须放到前面来
        if (doneRequired && argumentInfo.required) {
          this.logger.error(
            `Required argument need to be put ahead of others when registering command '${commandName}' in plugin '${commandDetail.pluginName}'`,
          );
        } else {
          commandDefinition.argument(
            argumentInfo.required ? `<${argumentName}>` : `[${argumentName}]`,
            argumentInfo.description,
          );
        }
        if (!argumentInfo.required) {
          doneRequired = true;
        }
      });
    }
    if (commandDetail.optionMap) {
      Object.entries(commandDetail.optionMap).forEach(([optionName, optionInfo]) => {
        const names = [optionInfo.alias ? `-${optionInfo.alias}` : '', `--${optionName}`].filter((str) => !!str);
        const getDescribedValueName = (valueName: string) => `<${valueName}>`;
        const optionDetailName = `${names.join(', ')}${
          optionInfo.valueName ? ' ' + getDescribedValueName(optionInfo.valueName) : ''
        }`;
        commandDefinition.option(optionDetailName, optionInfo.description);
      });
    }
    const disposeActionArgs = getActionArgsDisposal(commandDetail);
    commandDefinition.action((...actionArgs: any[]) => {
      const namedArgs = actionArgs[0];
      const { args = [] } = actionArgs.slice(-1)[0];
      commandDetail.fn({
        ...namedArgs,
        ...disposeActionArgs(args),
      });
    });
  }

  excute(): void {
    this.program.parse(process.argv);
  }
}

@Injectable()
export class CommandImpl implements Command {
  @Autowired(CommandRegistry)
  commandRegistry: CommandRegistry;

  /**
   * 运行
   *
   * @memberof CommandImpl
   */
  run() {
    this.commandRegistry.excute();
  }
}

/**
 * 获取运行时命令的参数
 *
 * @export
 * @param {CommandDetail} commandDetail
 * @returns {*}
 */
export function getActionArgsDisposal(commandDetail: CommandDetail) {
  const { argumentList } = commandDetail;
  const argumentNameList = (argumentList || []).map(([argumentName]) => argumentName);
  return (args: any[]) => {
    const result = minimist(args);
    const { _: argumentArgs, ...restMap } = result;
    const argumentMap = (argumentArgs || []).reduce((map, argVal, idx) => {
      map[argumentNameList[idx]] = argVal;
      return map;
    }, {});
    return {
      ...argumentMap,
      ...restMap,
    };
  };
}

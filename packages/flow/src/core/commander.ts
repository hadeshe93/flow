import path from 'path';
import fs from 'fs-extra';
import minimist from 'minimist';
import OriginalCommander from 'commander';
import { logger } from './logger';
import { getResolve } from '../utils/path';
import { createSandboxInstanceCreator } from '../utils/sandbox';

type CommandArgumentItem = [
  string,
  {
    description: string;
    required?: boolean;
  },
];
type CommandOptionMap = Record<
  string,
  {
    description: string;
    alias?: string;
    valueName?: string;
  }
>;
interface CommandDetail {
  command: string;
  description: string;
  fn: (...args: any) => void | Promise<void>;
  pluginName?: string;
  argumentList?: CommandArgumentItem[];
  optionMap?: CommandOptionMap;
  allowUnknownOption?: boolean;
}

export class Commander {
  logger = logger;
  commandsMap: Map<string, CommandDetail> = new Map();
  program = new OriginalCommander.Command();

  constructor() {
    this.init();
  }

  private init() {
    const CLI_NAME = 'hh';
    const rootResolve = getResolve(path.resolve(__dirname, '../../'));
    const packageJson = fs.readJsonSync(rootResolve('package.json'));
    this.program.name(CLI_NAME).usage('<command> [options]').version(packageJson.version);
    this.program.on('--help', () => {
      this.logger.log('');
      this.logger.log(`  Run ${CLI_NAME} <command> --help for detailed usage of given command.`);
    });
  }

  register(commandDetail: CommandDetail) {
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

  run() {
    this.program.parse(process.argv);
  }
}

export const getSandboxCommander = createSandboxInstanceCreator<Commander, 'register', { pluginName: string }>({
  register(commanderIns, extraOptions, commandDetail) {
    const { pluginName } = extraOptions || {};
    commanderIns.register({
      pluginName,
      ...commandDetail,
    });
  },
});

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

export const commander = new Commander();

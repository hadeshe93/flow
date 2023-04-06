import path from 'path';
import glob from 'glob';
import { Injector, Provider } from '@opensumi/di';

import {
  Logger,
  Plugger,
  Command,
  CommandRegistry,
  CommandContribution,
  Configuration,
  InitiatorManager,
  InitiatorManagerRegistry,
  InitiatorManagerContribution,
} from '@/types/core';
import { debug } from '@/utils/debug';
import { Domain } from '@/utils/di-helper';
import { initProcess } from '@/utils/process';
import { getInternalPluginName } from '@/utils/plugin';

import { LoggerImpl } from './logger';
import { BasicPlugin } from './plugin';
import { PluggerImpl } from './plugger';
import { CommandImpl, CommandRegistryImpl } from './command';
import { ConfigurationImpl } from './configuration';
import { createContributionProvider } from './contribution-provider';
import { InitiatorManagerImpl, InitiatorManagerRegistryImpl } from './initiator';

export {
  Domain,
  BasicPlugin,
  Logger,
  Plugger,
  Configuration,
  CommandContribution,
  InitiatorManagerContribution,
  InitiatorManagerRegistry,
  CommandRegistry,
  InitiatorManager,
};

/**
 * 核心类 Flow
 *
 * @export
 * @class Flow
 */
export class Flow {
  injector: Injector = new Injector();
  logger: Logger;
  plugger: Plugger;
  configuration: Configuration;
  initiatorManager: InitiatorManager;
  command: Command;

  initiatorManagerRegistry: InitiatorManagerRegistry;
  commandRegistry: CommandRegistry;

  constructor() {
    // 准备内部环境
    this.initBaseContributionProviders();
    this.initBaseProviders();
    this.initFields();
    // 初始化进程
    initProcess(this.logger);
  }

  /**
   * 初始化基础 providers
   *
   * @private
   * @memberof Flow
   */
  private initBaseProviders() {
    // 加载 providers 依赖
    const providers: Provider[] = [
      {
        token: Logger,
        useClass: LoggerImpl,
      },
      {
        token: Plugger,
        useClass: PluggerImpl,
      },
      {
        token: Configuration,
        useClass: ConfigurationImpl,
      },
      {
        token: InitiatorManager,
        useClass: InitiatorManagerImpl,
      },
      {
        token: InitiatorManagerRegistry,
        useClass: InitiatorManagerRegistryImpl,
      },
      {
        token: Command,
        useClass: CommandImpl,
      },
      {
        token: CommandRegistry,
        useClass: CommandRegistryImpl,
      },
    ];
    this.injector.addProviders(...providers);
  }

  /**
   * 初始化贡献点 providers
   *
   * @private
   * @memberof Flow
   */
  private initBaseContributionProviders() {
    // 加载 contributionProviders 依赖
    const contributionProviders = [InitiatorManagerContribution, CommandContribution];
    contributionProviders.forEach((contribution) => {
      createContributionProvider(this.injector, contribution);
    });
  }

  /**
   * 初始化 field 实例
   *
   * @private
   * @memberof Flow
   */
  private initFields() {
    this.logger = this.injector.get(Logger);
    this.plugger = this.injector.get(Plugger);
    this.initiatorManager = this.injector.get(InitiatorManager);
    this.command = this.injector.get(Command);

    this.initiatorManagerRegistry = this.injector.get(InitiatorManagerRegistry);
    this.commandRegistry = this.injector.get(CommandRegistry);
  }

  /**
   * 重新安装内部插件
   *
   * @memberof Flow
   */
  private async reInstallInternalPlugins() {
    // 先运行检查命令
    await this.plugger.doctor();

    // 「安装」内部插件
    const internalPluginsPath = path.resolve(__dirname, '../internal-plugins');
    const pluginPaths = glob.sync(path.join(internalPluginsPath, '/*'));
    const plugins = pluginPaths.map((pluginPath) => ({
      pluginName: getInternalPluginName(pluginPath),
      absolutePath: path.resolve(pluginPath, 'index'),
      fromInternal: true,
    }));
    await Promise.all(
      plugins.map((plugin) =>
        this.plugger.install(plugin.pluginName, {
          absolutePath: plugin.absolutePath,
          fromInternal: plugin.fromInternal,
        }),
      ),
    );
  }

  /**
   * 加载所有插件
   *
   * @private
   * @memberof Flow
   */
  private loadAllPlugins() {
    // 遍历「加载」插件，先加载内部插件，再加载外部插件
    const plugins = this.plugger.getAllPlugins().sort((pluginDetail) => (pluginDetail.fromInternal ? -1 : 1));
    const pluginProviders = plugins.reduce((acc, plugin) => {
      const rawPluginClass = require(plugin.absolutePath);
      const pluginClass = (rawPluginClass.default ?? rawPluginClass) as typeof BasicPlugin;
      const pluginIns = new pluginClass();
      return acc.concat(pluginIns.providers || []);
    }, []);
    debug('pluginProviders: %O', pluginProviders);
    this.injector.addProviders(...pluginProviders);

    // for (const plugin of plugins) {
    // const rawPluginIns = require(plugin.absolutePath);
    // const pluginIns = (rawPluginIns.default ?? rawPluginIns) as BasicPlugin;

    // // 给每个插件提供方便的工具
    // await pluginIns.apply({
    //   logger: this.logger,
    //   plugger: this.plugger,
    //   configuration: this.configuration,
    //   command: getSandboxCommander(this.command, {
    //     pluginName: plugin.name,
    //   }),
    //   initiatorManager: getSandboxInitiatorManager(this.initiatorManager, {
    //     pluginName: plugin.name,
    //   }),
    // });
    // }
  }

  /**
   * 初始化核心注册服务
   *
   * @private
   * @memberof Flow
   */
  private initCoreRegistry() {
    this.commandRegistry.initialize();
    this.initiatorManagerRegistry.initialize();
  }

  /**
   * 启动
   *
   * @memberof Flow
   */
  public async run() {
    await this.reInstallInternalPlugins();
    await this.loadAllPlugins();
    // 初始化核心的注册服务
    this.initCoreRegistry();
    // 启动 command
    this.command.run();
  }
}

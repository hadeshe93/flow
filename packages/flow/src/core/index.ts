import path from 'path';
import glob from 'glob';

import { logger, Logger } from './logger';
import { plugger, Plugger } from './plugger';
import { getInternalPluginName } from '../utils/plugin';
import { commander, getSandboxCommander, Commander } from './commander';
import { initiatorManager, getSandboxInitiatorManager, InitiatorManager } from './initiator';
import { configuration, Configuration } from './configuration';

/**
 * 核心类 Flow
 *
 * @export
 * @class Flow
 */
export class Flow {
  logger = logger;
  plugger = plugger;
  commander = commander;
  configuration = configuration;
  initiatorManager = initiatorManager;

  /**
   * 安装内部插件
   *
   * @memberof Flow
   */
  private installInternalPlugins() {
    const internalPluginsPath = path.resolve(__dirname, '../internal-plugins');
    const pluginPaths = glob.sync(path.join(internalPluginsPath, '/*'));
    const plugins = pluginPaths.map((pluginPath) => ({
      pluginName: getInternalPluginName(pluginPath),
      absolutePath: path.resolve(pluginPath, 'index'),
    }));
    plugins.forEach((plugin) => {
      plugger.install(plugin.pluginName, { absolutePath: plugin.absolutePath, fromInternal: true });
    });
  }

  /**
   * 初始化
   *
   * @memberof Flow
   */
  private async init() {
    // 先运行检查命令
    await plugger.doctor();
    // 「安装」内部插件
    this.installInternalPlugins();

    // 遍历「加载」插件
    // 备注：「安装」和「加载」的含义是不一样的
    const { plugins } = this.configuration.data;
    for (const plugin of plugins) {
      let pluginIns = require(plugin.absolutePath);
      pluginIns = pluginIns.default ?? pluginIns;
      // 给每个插件提供方便的工具
      await pluginIns.apply({
        logger: this.logger,
        plugger: this.plugger,
        configuration: this.configuration,
        commander: getSandboxCommander(this.commander, {
          pluginName: plugin.name,
        }),
        initiatorManager: getSandboxInitiatorManager(this.initiatorManager, {
          pluginName: plugin.name,
        }),
      });
    }
  }

  /**
   * 启动
   *
   * @memberof Flow
   */
  public async run() {
    await this.init();
    // 启动 commander
    this.commander.run();
  }
}

interface UserPluginApplyContext {
  logger: Logger;
  plugger: Plugger;
  commander: Commander;
  configuration: Configuration;
  initiatorManager: InitiatorManager;
}

export interface UserPlugin {
  apply: (ctx: UserPluginApplyContext) => void | Promise<void>;
}

export function definePluigin(userPlugin: UserPlugin): UserPlugin {
  return userPlugin;
}

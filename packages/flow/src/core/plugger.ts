import execa = require('execa');
import { logger } from './logger';
import { PluginDetail } from '../types/core';
import { configuration } from './configuration';
import { getFlowRootDir } from '../utils/path';

interface InstallOptions {
  absolutePath?: string;
  fromInternal?: boolean;
}

export class Plugger {
  pluginsMap: Map<string, PluginDetail> = new Map();
  logger = logger;
  configuration = configuration;

  constructor() {
    // 读取配置文件进行初始化
    const { plugins = [] } = this.configuration.data;
    plugins.forEach((pluginDetail) => {
      this.pluginsMap.set(pluginDetail.name, pluginDetail);
    });
  }

  /**
   * 安装 npm 包
   *
   * @private
   * @param {string} rawPkgName
   * @memberof Plugger
   */
  private async installPkg(rawPkgName: string) {
    try {
      const flowRootDir = getFlowRootDir();
      await execa('pnpm', ['install', rawPkgName], { cwd: flowRootDir, stdio: 'inherit' });
    } catch (err) {
      this.logger.error(`Error occurred in installing package '${rawPkgName}'`);
      process.exit(1);
    }
  }

  /**
   * 安装插件
   *
   * @param {string} rawPkgName
   * @param {InstallOptions} [options]
   * @memberof Plugger
   */
  public async install(rawPkgName: string, options?: InstallOptions) {
    if (!options?.fromInternal) {
      await this.installPkg(rawPkgName);
    }

    let name = '';
    const tempPkgNameBuff = rawPkgName.split('@');
    const tempPkgNameBuffLen = tempPkgNameBuff.length;

    if (rawPkgName.startsWith('@') && tempPkgNameBuffLen === 2) {
      name = rawPkgName;
    } else if (!rawPkgName.startsWith('@')) {
      name = tempPkgNameBuff[0];
    } else {
      name = tempPkgNameBuff.slice(0, -1).join('@');
    }

    const pluginDetail = this.pluginsMap.get(name) || ({} as PluginDetail);
    pluginDetail.name = name;
    const absolutePath = options?.absolutePath || require.resolve(name);
    pluginDetail.absolutePath = absolutePath;
    pluginDetail.config = pluginDetail.config ?? {};
    pluginDetail.fromInternal = options?.fromInternal || false;
    // 回写
    this.pluginsMap.set(name, pluginDetail);

    // 回写配置文件进行固化
    this.configuration.data.plugins = [...this.pluginsMap.values()];
    await this.configuration.save();
  }

  /**
   * 针对缓存的配置信息，避免运行出错
   *
   * @memberof Plugger
   */
  public async doctor() {
    const invalidInternalPlugins = [];
    // 检查失效的内部插件
    [...this.pluginsMap.entries()].forEach(([pluginName, pluginDetail]) => {
      let isPluginExisting = true;
      try {
        require.resolve(pluginDetail.absolutePath);
      } catch (err) {
        isPluginExisting = false;
      }
      if (!isPluginExisting) {
        invalidInternalPlugins.push(pluginName);
        logger.warn(
          `[plugger.doctor] ${
            pluginDetail.fromInternal ? 'Internal plugin' : 'Plugin'
          } '${pluginName}' is not found, and it will be remove from configuration.`,
        );
      }
    });

    // 将无效的内部插件从配置中剔除
    invalidInternalPlugins.forEach((pluginName) => {
      this.pluginsMap.delete(pluginName);
    });

    // 回写配置文件进行固化
    this.configuration.data.plugins = [...this.pluginsMap.values()];
    await this.configuration.save();
  }

  /**
   * 加载所有插件
   *
   * @protected
   * @param {*} flow
   * @memberof Plugger
   */
  protected loadAll(flow: any) {
    const entries = this.pluginsMap.entries();
    for (const entry of entries) {
      const [, pluginDetail] = entry;
      require(pluginDetail.absolutePath)(flow);
    }
  }
}

export const plugger = new Plugger();

import execa = require('execa');
import { Autowired, Injectable } from '@opensumi/di';

import { Configuration } from '@/types/core';
import { getFlowRootDir } from '@/utils/resolve';
import { Logger, Plugger, PluggerInstallOptions, PluginDetail } from '@/types/core';

@Injectable()
export class PluggerImpl implements Plugger {
  private pluginsMap: Map<string, PluginDetail> = new Map();

  @Autowired(Configuration)
  private configuration: Configuration;

  @Autowired(Logger)
  private logger: Logger;

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
  public async install(rawPkgName: string, options?: PluggerInstallOptions) {
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
        this.logger.warn(
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
   * 获取所有的插件列表
   *
   * @returns {*}  {PluginDetail[]}
   * @memberof PluggerImpl
   */
  public getAllPlugins(): PluginDetail[] {
    return this.configuration.data.plugins;
  }
}

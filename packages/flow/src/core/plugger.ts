import { logger } from './logger';
import execa = require('execa');

import { PluginDetail } from '../types/core';
import { configuration } from './configuration';
import { getFlowRootDir } from '../utils/path';

interface InstallOptions {
  absolutePath?: string;
  fromLocal?: boolean;
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
  async install(rawPkgName: string, options?: InstallOptions) {
    if (!options?.fromLocal) {
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
    // 回写
    this.pluginsMap.set(name, pluginDetail);

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

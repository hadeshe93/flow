import { Injectable } from '@opensumi/di';
import { FLOW_CONFIGURATION_PATH } from './constants';

import { FlowConfiguration, Configuration } from '@/types/core';
import { createMemFsCreator } from '@/utils/memfs';

const createMemFs = createMemFsCreator();

/**
 * 管理 flow 配置的类
 *
 * @export
 * @class Configuration
 */
@Injectable()
export class ConfigurationImpl implements Configuration {
  private fs = createMemFs();
  private lastData: FlowConfiguration = {
    plugins: [],
  };
  public data: FlowConfiguration = {
    plugins: [],
  };

  constructor() {
    this.data = this.load();
    this.lastData = JSON.parse(JSON.stringify(this.data));
  }

  // 加载配置
  private load(): FlowConfiguration {
    return (
      (this.fs.readJSON(FLOW_CONFIGURATION_PATH) as unknown as FlowConfiguration) || {
        plugins: [],
      }
    );
  }

  // 保存配置
  async save(): Promise<void> {
    const lastDataSnapshot = JSON.stringify(this.lastData);
    const dataSnapshot = JSON.stringify(this.data);
    if (lastDataSnapshot === dataSnapshot) return;

    this.fs.writeJSON(FLOW_CONFIGURATION_PATH, this.data);
    await new Promise((resolve, reject) => {
      this.fs.commit((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(undefined);
      });
    });
    this.lastData = JSON.parse(dataSnapshot);
  }
}


export interface PluginDetail {
  name: string;
  absolutePath: string;
  config: Record<string, any>;
  // TODO：后期加上版本管理
  // requireVersion?: string;
  // installedVersion?: string;
}

export interface FlowConfiguration {
  // 已安装的插件列表
  plugins: PluginDetail[];
}

export interface ApplyPluginContext<TLogger, TCommander, TConfiguration, TInitiatorManager extends any = any> {
  logger: TLogger;
  commander: TCommander;
  configuration: TConfiguration;
  initiatorManager: TInitiatorManager;
}

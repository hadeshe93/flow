import { Ora } from 'ora';
import Enquirer from 'enquirer';
import { Editor } from 'mem-fs-editor';
import { ConstructorOf } from '@opensumi/di';

export interface PluginDetail {
  name: string;
  absolutePath: string;
  config: Record<string, any>;
  // 是否从内部安装的
  fromInternal: boolean;
  // TODO：后期加上版本管理
  // requireVersion?: string;
  // installedVersion?: string;
}

export interface FlowConfiguration {
  // 已安装的插件列表
  plugins: PluginDetail[];
}

export interface ApplyPluginContext<TLogger, TCommander, TConfiguration, TInitiatorManager> {
  logger: TLogger;
  commander: TCommander;
  configuration: TConfiguration;
  initiatorManager: TInitiatorManager;
}

export interface Registry {
  initialize(...args: any[]): any;
}

// Configuration 类型定义，解耦具体实现
export const Configuration = Symbol('Configuration');
export interface Configuration {
  data: FlowConfiguration;
  save(): Promise<void>;
}

// ContributionProvider 类型定义，解耦具体实现
export const ContributionProvider = Symbol('ContributionProvider');
export interface ContributionProvider<T extends object> {
  getContributions(): T[];
  addContribution(...contributionsCls: ConstructorOf<any>[]): void;
  reload(): T[];
}

// Logger 类型定义，解耦具体实现
export const Logger = Symbol('Logger');
export interface Logger {
  log: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  success: (...args: any[]) => void;
  ing: (...args: any[]) => Ora | Promise<Ora>;
}

// Plugger 类型定义，解耦具体实现
export const Plugger = Symbol('Plugger');
export interface Plugger {
  install(rawPkgName: string, options?: PluggerInstallOptions): Promise<void>;
  doctor(): Promise<void>;
  getAllPlugins(): PluginDetail[];
}
export interface PluggerInstallOptions {
  absolutePath?: string;
  fromInternal?: boolean;
}

// Command 类型定义，解耦具体实现
export const Command = Symbol('Command');
export interface Command {
  run(): void;
}

// CommandRegistry 类型定义，解耦具体实现
export const CommandRegistry = Symbol('CommandRegistry');
export interface CommandRegistry extends Registry {
  initialize(): void;
  excute(): void;
  registerCommand(commandDetail: CommandDetail): void;
}
export interface CommandDetail {
  command: string;
  description: string;
  fn: (...args: any) => void | Promise<void>;
  pluginName?: string;
  argumentList?: CommandArgumentItem[];
  optionMap?: CommandOptionMap;
  allowUnknownOption?: boolean;
}
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

// CommandContribution 类型定义，解耦具体实现
export const CommandContribution = Symbol('CommandContribution');
export interface CommandContribution {
  registerCommand(commandRegistry: CommandRegistry): void;
}

// InitiatorManager 类型定义，解耦具体实现
export const InitiatorManager = Symbol('InitiatorManager');
export interface InitiatorManager {
  run(): Promise<void>;
}

// InitiatorManagerRegistry 类型定义，解耦具体实现
export const InitiatorManagerRegistry = Symbol('InitiatorManagerRegistry');
export interface InitiatorManagerRegistry {
  initiatorMap: InitiatorMap;
  initialize(): void;
  registerInitiator(initiatorDetail: InitiatorDetail): void;
}
export interface InitiatorDetail {
  pluginName?: string;
  templateName: string;
  fn(...args): Interactor | Promise<Interactor>;
}
export type InitiatorMap<TemplateName extends string = string> = Map<TemplateName, InitiatorDetail>;

// InitiatorManagerContribution 类型定义，解耦具体实现
export const InitiatorManagerContribution = Symbol('InitiatorManagerContribution');
export interface InitiatorManagerContribution {
  registerInitiator(initiatorManagerRegistry: InitiatorManagerRegistry): void;
}

// Interactor 类型定义，解耦具体实现
export const Interactor = Symbol('Interactor');
export interface Interactor {
  initialize(options?: OptionsForRunningInteractor): Promise<void>;
  prompt(enquirer: typeof Enquirer): Promise<void>;
  act(fs: Editor): Promise<void>;
  run(options?: OptionsForRunningInteractor): Promise<void>;
}
export type OptionsForRunningInteractor = Record<string, any>;

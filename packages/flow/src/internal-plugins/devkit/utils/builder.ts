import path from 'path';
import fs from 'fs-extra';
import BuilderCore, {
  esbuildDynamicImport,
  formatBuilderConfig,
  BuilderCoreOptions,
  SupportedBuilderMode,
  AbstractBuilder,
} from '@hadeshe93/builder-core';
import BuilderVite from '@hadeshe93/builder-vite';
import BuilderWebpack from '@hadeshe93/builder-webpack';

import { builderModeMap, PROJECT_CONFIG_NAME, PROJECT_CONFIG_EXTS } from '../constants/configs';
import { resolveProjectPagesPath } from './resolve';

export interface BootstrapBuilderOptions {
  command: string;
  projectPath: string;
  pageName: string;
  builderName: string;
  logger?: BuilderCoreOptions['logger'];
}

// 目前支持的构建器
export const SUPPORTED_BUILDERS: Record<string, typeof AbstractBuilder> = {
  webpack: BuilderWebpack,
  vite: BuilderVite,
};

// 实例化核心 builder
const builder = new BuilderCore({
  logger: console.log.bind(console),
});
// 实例化并注册 builder
Object.entries(SUPPORTED_BUILDERS).forEach((item) => {
  const BuilderClass = item[1] as new () => any;
  builder.registerBuilder(item[0] as any, new BuilderClass());
});

/**
 * 启动 builder
 *
 * @param {BootstrapBuilderOptions} options
 */
export async function bootstrapBuilder(options: BootstrapBuilderOptions) {
  const { command, projectPath, pageName, logger = console.log.bind(console) } = options;
  const builderName = options.builderName as any;
  const projectPagesPath = resolveProjectPagesPath(projectPath);
  const mode = builderModeMap[command] as SupportedBuilderMode;
  if (!mode) {
    throw new Error(`Command '${command}' is not allowed.`);
  }
  builder.logger = logger;

  // 查找配置文件
  let projectConfigPath = '';
  for (const ext of PROJECT_CONFIG_EXTS) {
    projectConfigPath = path.resolve(projectPagesPath, pageName, `${PROJECT_CONFIG_NAME}${ext}`);
    const isExisted = await fs.pathExists(projectConfigPath);
    if (isExisted) break;
  }
  if (!projectConfigPath) {
    throw new Error(`Project config file does not exist`);
  }
  // 读取项目配置文件
  const projectConfig = await esbuildDynamicImport(projectConfigPath);

  // 构造构建配置
  const builderConfig = await formatBuilderConfig({
    mode,
    builderName,
    projectPath,
    pageName,
    projectConfig,
  });

  // 开始执行
  const excutor = builder.createExcutor([builderConfig]);
  await excutor();
}

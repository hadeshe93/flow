import path from 'path';
import keyBy from 'lodash/keyBy';
import type { TemplateFrameworkConfig } from '../types/config';

// 项目配置的文件名，不带扩展名
export const PROJECT_CONFIG_NAME = 'project.config';
export const PROJECT_CONFIG_EXTS = ['.js', '.ts'];
// 项目页面相对的路径
export const PAGES_RELATIVE_PATH = path.join('src', 'pages');

// 项目模板配置
const TEMPLATE_MONOREPO_URL = 'github:hadeshe93/web-project-starter';
export const templateFrameworkConfigs: TemplateFrameworkConfig[] = [
  {
    templateType: 'solid',
    templateName: 'vite4-solid',
    repoUrl: TEMPLATE_MONOREPO_URL,
    repoTemplatePath: 'packages/vite4-solid',
  },
  {
    templateType: 'vue3',
    templateName: 'vite4-vue3',
    repoUrl: TEMPLATE_MONOREPO_URL,
    repoTemplatePath: 'packages/vite4-vue3',
  },
  {
    templateType: 'vue3',
    templateName: 'webpack5-vue3',
    repoUrl: TEMPLATE_MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-vue3',
  },
  {
    templateType: 'react17',
    templateName: 'webpack5-react',
    repoUrl: TEMPLATE_MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-react',
  },
  {
    templateType: 'vue3-element',
    templateName: 'webpack5-vue3-element',
    repoUrl: TEMPLATE_MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-vue3-element',
  },
  {
    templateType: 'react17-antd',
    templateName: 'webpack5-react-antd',
    repoUrl: TEMPLATE_MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-react-antd',
  },
];

// 插件命令配置
const commonCommandOption = {
  cwd: {
    description: 'Specify current working directory',
    valueName: 'path',
  },
  pageName: {
    description: 'Specify the name of page',
    valueName: 'pageName',
  },
  builderName: {
    description: 'Specify the name of builder',
    valueName: 'builderName',
  },
};
export const commandsOptions = [
  // 调试
  {
    command: 'dev',
    description: 'Develope page of project',
    optionMap: {
      ...commonCommandOption,
    },
  },
  // 构建
  {
    command: 'build',
    description: 'Build page of project',
    optionMap: {
      ...commonCommandOption,
    },
  },
  // 部署
  {
    command: 'deploy',
    description: 'Deploy page of project',
    optionMap: {
      ...commonCommandOption,
      reset: {
        description: 'Reset configs of aliyun oss',
      },
      accessKeyId: {
        description: 'Specify the temporary accessKeyId for aliyun oss',
        valueName: 'id',
      },
      accessKeySecret: {
        description: 'Specify the temporary accessKeySecret for aliyun oss',
        valueName: 'secret',
      },
      bucket: {
        description: 'Specify the bucket for aliyun oss',
        valueName: 'bucket',
      },
      region: {
        description: 'Specify the region for aliyun oss',
        valueName: 'region',
      },
    },
  },
];
export const commandsOptionMap = keyBy(commandsOptions, (option) => option.command);

// 构建器模式映射表
export const builderModeMap = {
  [commandsOptionMap.dev.command]: 'development',
  [commandsOptionMap.build.command]: 'production',
};

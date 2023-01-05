import keyBy from 'lodash/keyBy';
import type { TemplateFrameworkConfig } from '../types/config';

const MONOREPO_URL = 'github:hadeshe93/webpack5-starter';

// 项目模板配置
export const templateFrameworkConfigs: TemplateFrameworkConfig[] = [
  {
    templateType: 'vue3',
    templateName: 'webpack5-vue3',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-vue3',
  },
  {
    templateType: 'react17',
    templateName: 'webpack5-react',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-react',
  },
  {
    templateType: 'vue3-element',
    templateName: 'webpack5-vue3-element',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-vue3-element',
  },
  {
    templateType: 'react17-antd',
    templateName: 'webpack5-react-antd',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-react-antd',
  },
];

// 插件命令配置
const commonCommandOption = {
  cwd: {
    description: 'Specify current working directory',
    valueName: 'path',
  },
};
export const commandsOptions = [
  // 调试
  {
    command: 'dev',
    description: 'Develope page of project',
    optionMap: {
      ...commonCommandOption,
      pageName: {
        description: 'Specify the name of page',
        valueName: 'pageName',
      },
    },
  },
  // 构建
  {
    command: 'build',
    description: 'Build page of project',
    optionMap: {
      ...commonCommandOption,
      pageName: {
        description: 'Specify the name of page',
        valueName: 'pageName',
      },
    },
  },
  // 部署
  {
    command: 'deploy',
    description: 'Deploy page of project',
    argumentList: [
      [
        'pageName',
        {
          description: 'The target page name',
          required: false,
        },
      ],
    ] as any,
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

import type { TemplateFrameworkConfig } from '../types/config';

const MONOREPO_URL = 'github:hadeshe93/webpack5-starter';

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

export type TemplateFrameworkType = 'vue3' | 'react17' | 'vue3-element' | 'react17-antd';

export type TemplateFrameworkConfig = {
  templateType: 'vue3' | 'react17' | 'vue3-element' | 'react17-antd';
  templateName: string;
  repoUrl: string;
  repoTemplatePath: string;
  [key: string]: any;
};

export type TemplateFrameworkConfigMap = {
  [key in TemplateFrameworkType]: TemplateFrameworkConfig;
};

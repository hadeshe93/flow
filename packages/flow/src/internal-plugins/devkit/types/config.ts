export type TemplateFrameworkType = 'solid' | 'vue3' | 'react17' | 'vue3-element' | 'react17-antd';

export type TemplateFrameworkConfig = {
  templateType: TemplateFrameworkType;
  templateName: string;
  repoUrl: string;
  repoTemplatePath: string;
  [key: string]: any;
};

export type TemplateFrameworkConfigMap = {
  [key in TemplateFrameworkType]: TemplateFrameworkConfig;
};

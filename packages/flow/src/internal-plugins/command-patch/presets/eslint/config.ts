export const necessaryDevDependencies = ['eslint', 'prettier', '@hadeshe93/eslint-config-hh'];

interface QuestionItem {
  type: string;
  options: {
    name: string;
    message: string;
    [key: string]: any;
  };
  dependenciesMap?: Record<string, string[]>;
  devDependenciesMap?: Record<string, string[]>;
}
export const questionList: QuestionItem[] = [
  // 项目需要运行在什么环境
  {
    type: 'MultiSelect',
    options: {
      name: 'env',
      message: 'Select enviroments that your project need (muti select):',
      limit: 5,
      choices: [
        { name: 'browser' },
        { name: 'node' },
        { name: 'es6' },
        { name: 'mocha' },
        { name: 'jest' },
        { name: 'jquery' },
      ],
    },
  },
];
